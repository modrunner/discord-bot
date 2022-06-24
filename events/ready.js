const { Projects } = require('./../dbObjects');
const { request } = require('undici');
const { MessageEmbed } = require('discord.js');
const { cf_api_key } = require('../config.json');
const { releaseTypeToString } = require('../util/releaseTypeToString');
const logger = require('./../logger');
const dayjs = require('dayjs');

module.exports = {
	name: 'ready',
	async execute(client) {
		logger.info(`Bot online, logged in as ${client.user.tag}`);

		// 10m = 600,000ms
		doUpdateCheck();
		setInterval(doUpdateCheck, 600000);

		async function doUpdateCheck() {
			logger.info('Checking for updates for projects in tracking...');

			const projects = await Projects.findAll();
			const guilds = client.guilds.cache.clone();

			for (const project of projects) {
				let fetchedProject = 0;
				const projectPlatform = project.project_id.match(/[A-z]/) ? 'modrinth' : 'curseforge';
				if (projectPlatform === 'curseforge') {
					try {
						const apiRequest = await request(`https://api.curseforge.com/v1/mods/${project.project_id}`, { headers: { 'x-api-key': cf_api_key } });
						fetchedProject = await getJSONResponse(apiRequest.body);
						fetchedProject = fetchedProject.data;
					} catch (error) {
						logger.error(error);
						continue;
					}
				} else {
					try {
						const apiRequest = await request(`https://api.modrinth.com/v2/project/${project.project_id}`);
						fetchedProject = await getJSONResponse(apiRequest.body);
					} catch (error) {
						logger.error(error);
						continue;
					}
				}

				const fetchedProjectLastUpdated = (projectPlatform === 'curseforge') ? fetchedProject.dateReleased : fetchedProject.updated;
				const fetchedProjectTitleName = (projectPlatform === 'curseforge') ? fetchedProject.name : fetchedProject.title;

				const fetchedProjectUpdatedDate = new Date(fetchedProjectLastUpdated);
				if (project.date_modified.getTime() === fetchedProjectUpdatedDate.getTime()) continue;

				logger.info(`Update detected for project: ${fetchedProjectTitleName}`);

				await Projects.update({ date_modified: fetchedProjectLastUpdated },
					{
						where: {
							project_id: fetchedProject.id,
						},
					});

				for (let i = 0; i < guilds.size; i++) {
					const guild = guilds.at(i);
					if (guild.id === project.guild_id) {
						sendUpdateMessage(project, fetchedProject, guild, projectPlatform);
					}
				}
			}
		}

		async function sendUpdateMessage(project, fetchedProject, guild, projectPlatform) {
			if (projectPlatform === 'curseforge') {
				const update = new MessageEmbed()
					.setColor('#f87a1b')
					.setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
					.setTitle(`${fetchedProject.name} has been updated`)
					.setDescription(`A new version is available for ${fetchedProject.name}.`)
					.setThumbnail(`${fetchedProject.logo.url}`)
					.setFields(
						{ name: 'Version Name', value: `${fetchedProject.latestFilesIndexes[0].filename}` },
						{ name: 'Version Number', value: `${fetchedProject.latestFilesIndexes[0].filename}` },
						{ name: 'Release Type', value: `${releaseTypeToString(fetchedProject.latestFilesIndexes[0].releaseType)}` },
						{ name: 'Date Published', value: `${dayjs(fetchedProject.dateReleased).format('MMM D, YYYY h:mm A')}` },
					)
					.setTimestamp();
				await guild.channels.cache.find(element => element.id === project.post_channel).send({ embeds: [ update ] });
			} else {
				const apiRequest = await request(`https://api.modrinth.com/v2/project/${fetchedProject.id}/version`);
				var fetchedVersion = await getJSONResponse(apiRequest.body);

				const update = new MessageEmbed()
					.setColor('DARK_GREEN')
					.setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
					.setTitle(`${fetchedProject.title} has been updated`)
					.setDescription(`A new version is available for ${fetchedProject.title}.`)
					.setThumbnail(`${fetchedProject.icon_url}`)
					.setFields(
						{ name: 'Version Name', value: `${fetchedVersion[0].name}` },
						{ name: 'Version Number', value: `${fetchedVersion[0].version_number}` },
						{ name: 'Release Type', value: `${fetchedVersion[0].version_type}` },
						{ name: 'Date Published', value: `${dayjs(fetchedVersion[0].date_published).format('MMM D, YYYY h:mm A')}` },
					)
					.setTimestamp();
				await guild.channels.cache.find(element => element.id === project.post_channel).send({ embeds: [ update ] });
			}
		}

		async function getJSONResponse(body) {
			let fullBody = '';

			for await (const data of body) {
				fullBody += data.toString();
			}

			return JSON.parse(fullBody);
		}
	},
};