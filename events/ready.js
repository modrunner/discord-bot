const logger = require('./../logger');
const { getMods, getProjects, listProjectVersions, getModFileChangelog } = require('../api/apiMethods');
const ms = require('ms');
const dayjs = require('dayjs');
const { TrackedProjects, GuildSettings } = require('../dbObjects');
const getJSONResponse = require('../api/getJSONResponse');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, ActivityType } = require('discord.js');
const { ApiCallManager } = require('../api/apiCallManager');

module.exports = {
	name: 'ready',
	async execute(client) {
		logger.info(`Bot online, logged in as ${client.user.tag}`);

		await checkForProjectUpdates(client);
		await updatePresenceData(client);

		setInterval(runUpdateCheck, ms('1m'));
		setInterval(runUpdatePresence, ms('10m'));
		setInterval(runLogCalls, ms('24h'));

		async function runUpdateCheck() {
			await checkForProjectUpdates(client);
		}

		function runUpdatePresence() {
			updatePresenceData(client);
		}

		function runLogCalls() {
			ApiCallManager.logCalls();
		}
	},
};

async function checkForProjectUpdates(client) {
	logger.debug('Checking for updates for projects in tracking...');


	const dbCurseforgeProjects = await TrackedProjects.findAll({ where: { platform: 'curseforge' } });
	const dbModrinthProjects = await TrackedProjects.findAll({ where: { platform: 'modrinth' } });

	const dbCurseforgeProjectsIds = [];
	for (const dbProject of dbCurseforgeProjects) {
		dbCurseforgeProjectsIds.push(dbProject.id);
	}

	const dbModrinthProjectIds = [];
	for (const dbProject of dbModrinthProjects) {
		dbModrinthProjectIds.push(dbProject.id);
	}


	let requestedMods, requestedProjects;
	if (dbCurseforgeProjectsIds.length) {
		var curseforgeResponseData = await getMods(dbCurseforgeProjectsIds);
		if (curseforgeResponseData) {
			if (curseforgeResponseData.statusCode === 200) {
				requestedMods = await getJSONResponse(curseforgeResponseData.body);
			} else {
				logger.warn(`CurseForge project update check failure: a Get Mods request to CurseForge returned a ${curseforgeResponseData.statusCode} status code.`);
			}
		} else {
			logger.warn('CurseForge project update check failure: a connection could not be established to CurseForge\'s API.');
		}
	} else {
		logger.info('No CurseForge projects detected in database. Skipping CurseForge update check.');
	}

	if (dbModrinthProjectIds.length) {
		var modrinthResponseData = await getProjects(dbModrinthProjectIds);
		if (modrinthResponseData) {
			if (modrinthResponseData.statusCode === 200) {
				requestedProjects = await getJSONResponse(modrinthResponseData.body);
			} else {
				logger.warn(`Modrinth project update check failure: a Get Projects request to Modrinth returned a ${modrinthResponseData.statusCode} status code.`);
			}
		} else {
			logger.warn('Modrinth project update check failure: a connection could not be established to Modrinth\'s API.');
		}
	} else {
		logger.info('No Modrinth projects detected in database. Skipping Modrinth update check.');
	}


	if (dbCurseforgeProjects.length) {
		for (const dbProject of dbCurseforgeProjects) {
			const requestedMod = requestedMods.data.find(element => element.id.toString() === dbProject.id);
			if (dbProject.date_updated.getTime() !== new Date(requestedMod.dateReleased).getTime()) {
				logger.info(`Project ${requestedMod.name} has updated its release date from ${dayjs(dbProject.date_updated).format('YYYY-MM-DD HH:mm:ss')} to ${dayjs(requestedMod.dateReleased).format('YYYY-MM-DD HH:mm:ss')}`);
				if (requestedMod.latestFiles[requestedMod.latestFiles.length - 1].fileStatus !== 4) {
					logger.info(`Project latest file status is not 4. It's ${requestedMod.latestFiles[requestedMod.latestFiles.length - 1].fileStatus}. Aborting update check.`);
					continue;
				}
				if (dbProject.latest_file_id === requestedMod.latestFiles[requestedMod.latestFiles.length - 1].id.toString()) {
					logger.info(`Project latest file id matches database. It's ${requestedMod.latestFiles[requestedMod.latestFiles.length - 1].id.toString()} (database is ${dbProject.latest_file_id}). Aborting update check.`);

					await TrackedProjects.update({
						date_updated: requestedMod.dateReleased,
					}, {
						where: {
							id: dbProject.id,
						},
					});

					continue;
				}
				logger.info(`Update detected for CurseForge project ${ dbProject.title } (${ dbProject.id })`);

				await TrackedProjects.update({
					date_updated: requestedMod.dateReleased,
					latest_file_id: requestedMod.latestFiles[requestedMod.latestFiles.length - 1].id,
				}, {
					where: {
						id: dbProject.id,
					},
				});

				await sendUpdateEmbed(requestedMod, dbProject, client);
			}
		}
	}
	logger.debug('CurseForge update check complete.');

	if (dbModrinthProjects.length) {
		for (const dbProject of dbModrinthProjects) {
			const requestedProject = requestedProjects.find(project => project.id === dbProject.id);
			if (dbProject.date_updated.getTime() !== new Date(requestedProject.updated).getTime()) {
				logger.debug(`Update detected for Modrinth project ${ dbProject.title } (${ dbProject.id })`);

				await TrackedProjects.update({ date_updated: requestedProject.updated }, {
					where: {
						id: dbProject.id,
					},
				});

				await sendUpdateEmbed(requestedProject, dbProject, client);
			}
		}
	}
	logger.debug('Modrinth update check complete.');
}

async function sendUpdateEmbed(requestedProject, dbProject, client) {
	let normalEmbed, compactEmbed, buttonRow;

	switch (dbProject.platform) {
	case 'curseforge': {
		const responseData = await getModFileChangelog(requestedProject.id, requestedProject.latestFiles[requestedProject.latestFiles.length - 1].id);
		if (responseData) {
			if (responseData.statusCode === 200) {
				var rawChangelog = await getJSONResponse(responseData.body);
			} else {
				logger.warn(`CurseForge project notification post failure: a Get Mod File Changelog request to CurseForge returned a ${ responseData.statusCode } status code.`);
			}
		} else {
			logger.warn('CurseForge project notification post failure: a connection could not be established to CurseForge\'s API.');
		}

		const changelogNoHTML = rawChangelog.data.replace(/<br>/g, '\n').replace(/<.*?>/g, '');

		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
		const trimmedChangelog = trim(changelogNoHTML, 4000);

		const latestFile = requestedProject.latestFiles[requestedProject.latestFiles.length - 1];

		logger.info(`
		${requestedProject.name} latest file info:
		id: ${latestFile.id}
		displayName: ${latestFile.displayName}
		fileName: ${latestFile.fileName}
		releaseType: ${latestFile.releaseType}
		fileStatus: ${latestFile.fileStatus}
		fileDate: ${dayjs(latestFile.fileDate).format('YYYY-MM-DD HH:mm:ss')}
		hash0: ${latestFile.hashes[0].value} (algo: ${latestFile.hashes[0].algo})
		hash1: ${latestFile.hashes[1].value} (algo: ${latestFile.hashes[1].algo})
		`);

		normalEmbed = new EmbedBuilder()
			.setColor('#f87a1b')
			.setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
			.setTitle(`${requestedProject.name} has been updated`)
			.setDescription(`**Changelog:** ${codeBlock(trimmedChangelog)}`)
			.setThumbnail(`${requestedProject.logo.url}`)
			.setFields(
				{ name: 'Version Name', value: `${latestFile.displayName}` },
				{ name: 'Version Number', value: `${latestFile.fileName}` },
				{ name: 'Release Type', value: `${releaseTypeToString(latestFile.releaseType)}` },
				{ name: 'Date Published', value: `<t:${dayjs(latestFile.fileDate).unix()}:f>` },
			)
			.setTimestamp();

		compactEmbed = new EmbedBuilder()
			.setColor('#f87a1b')
			.setTitle(`${requestedProject.name} ${latestFile.displayName}`)
			.setURL(`https://www.curseforge.com/minecraft/${classIdToUrlString(requestedProject.classId)}/${requestedProject.slug}/files/${requestedProject.latestFilesIndexes[0].fileId}`)
			.setDescription(`${latestFile.fileName} (${releaseTypeToString(latestFile.releaseType)})`)
			.setFooter({ text: `${dayjs(requestedProject.dateReleased).format('MMM D, YYYY')}`, iconURL: 'https://i.imgur.com/uA9lFcz.png' });

		const viewButton = new ButtonBuilder()
			.setURL(`https://www.curseforge.com/minecraft/${classIdToUrlString(requestedProject.classId)}/${requestedProject.slug}/files/${requestedProject.latestFilesIndexes[0].fileId}`)
			.setLabel('View on CurseForge')
			.setStyle(ButtonStyle.Link);
		buttonRow = new ActionRowBuilder().addComponents(viewButton);

		break;
	}
	case 'modrinth': {
		const responseData = await listProjectVersions(requestedProject.id);
		if (responseData) {
			if (responseData.statusCode === 200) {
				var requestedVersions = await getJSONResponse(responseData.body);
			} else {
				logger.warn(`Modrinth project notification post failure: a List Project's Versions request to Modrinth returned a ${ responseData.statusCode } status code.`);
			}
		} else {
			logger.warn('Modrinth project notification post failure: a connection could not be established to Modrinth\'s API.');
		}

		const latestVersion = requestedVersions[0];

		const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
		const trimmedDescription = trim(latestVersion.changelog, 4000);

		normalEmbed = new EmbedBuilder()
			.setColor('DarkGreen')
			.setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
			.setTitle(`${requestedProject.title} has been updated`)
			.setDescription(`**Changelog:** ${codeBlock(trimmedDescription)}`)
			.setThumbnail(`${requestedProject.icon_url}`)
			.setFields(
				{ name: 'Version Name', value: `${latestVersion.name}` },
				{ name: 'Version Number', value: `${latestVersion.version_number}` },
				{ name: 'Release Type', value: `${capitalize(latestVersion.version_type)}` },
				{ name: 'Date Published', value: `<t:${dayjs(latestVersion.date_published).unix()}:f>` },
			)
			.setTimestamp();

		compactEmbed = new EmbedBuilder()
			.setColor('DarkGreen')
			.setTitle(`${requestedProject.title} ${latestVersion.name}`)
			.setURL(`https://modrinth.com/${requestedProject.project_type}/${requestedProject.slug}/version/${latestVersion.version_number}`)
			.setDescription(`${latestVersion.version_number} (${capitalize(latestVersion.version_type)})`)
			.setFooter({ text: `${dayjs(latestVersion.date_published).format('MMM D, YYYY')}`, iconURL: 'https://i.imgur.com/2XDguyk.png' });

		const viewButton = new ButtonBuilder()
			.setURL(`https://modrinth.com/${requestedProject.project_type}/${requestedProject.slug}/version/${latestVersion.version_number}`)
			.setLabel('View on Modrinth')
			.setStyle(ButtonStyle.Link);
		buttonRow = new ActionRowBuilder().addComponents(viewButton);

		break;
	}
	default:
		logger.warn('sendUpdateEmbed: invalid platform');
		break;
	}

	for (const dbGuild of dbProject.guild_data.guilds) {
		const guild = client.guilds.cache.find(element => element.id === dbGuild.id);
		for (const dbChannel of dbGuild.channels) {
			const channel = guild.channels.cache.find(element => element.id === dbChannel);
			// eslint-disable-next-line no-unused-vars
			const [dbGuildSettings, isCreated] = await GuildSettings.findOrCreate({
				where: {
					guild_id: guild.id,
				},
				defaults: {
					guild_id: guild.id,
				},
			});
			if (dbGuildSettings.is_lightweight_mode_enabled) {
				await channel.send({ embeds: [compactEmbed] });
			} else {
				await channel.send({ embeds: [normalEmbed], components: [buttonRow] });
			}
		}
	}
}

async function updatePresenceData(client) {
	logger.debug('Updating presence data...');

	const dbProjects = await TrackedProjects.findAll();

	client.user.setPresence({
		activities: [{
			type: ActivityType.Playing,
			name: `Watching ${dbProjects.length} projects for updates in ${client.guilds.cache.size} servers.`,
		}],
		status: 'online',
	});
	logger.debug('Presence updated.');
}

function classIdToUrlString(classId) {
	switch (classId) {
	case 5:
		return 'bukkit-plugins';
	case 6:
		return 'mc-mods';
	case 12:
		return 'texture-packs';
	case 17:
		return 'worlds';
	case 4471:
		return 'modpacks';
	case 4546:
		return 'customization';
	case 4559:
		return 'mc-addons';
	default:
		return 'unknownClassIdValue';
	}
}

function releaseTypeToString(releaseType) {
	switch (releaseType) {
	case 1:
		return 'Release';
	case 2:
		return 'Beta';
	case 3:
		return 'Alpha';
	default:
		return 'UnknownReleaseType';
	}
}
function capitalize(string) {
	return string.replace(string.charAt(0), String.fromCharCode(string.charCodeAt(0) - 32));
}