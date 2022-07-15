const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { codeBlock } = require('@discordjs/builders');
const { releaseTypeToString } = require('../util/releaseTypeToString');
const { listProjectVersions, getModFileChangelog } = require('../api/apiMethods');
const dayjs = require('dayjs');
const getJSONResponse = require('../api/getJSONResponse');
const classIdToUrlString = require('../util/classIdToUrlString');
const { GuildSettings } = require('../dbObjects');

module.exports = {
	async sendUpdateMessage(fetchedProject, guild, channel, fetchedProjectPlatform) {
		switch (fetchedProjectPlatform) {
		case 'curseforge': {
			let guildSettings = await GuildSettings.findOne({
				where: {
					guild_id: guild.id,
				},
			});
			if (!guildSettings) guildSettings = await GuildSettings.create({ guild_id: guild.id });

			if (guildSettings.is_lightweight_mode_enabled) {
				const update = new MessageEmbed()
					.setColor('#f87a1b')
					.setTitle(`${fetchedProject.name} ${fetchedProject.latestFilesIndexes[0].filename}`)
					.setURL(`https://www.curseforge.com/minecraft/${classIdToUrlString(fetchedProject.classId)}/${fetchedProject.slug}/files/${fetchedProject.latestFilesIndexes[0].fileId}`)
					.setDescription(`${fetchedProject.latestFilesIndexes[0].filename} (${releaseTypeToString(fetchedProject.latestFilesIndexes[0].releaseType)})`)
					.setFooter({ text: `${dayjs(fetchedProject.dateReleased).format('MMM D, YYYY h:mm A')}`, iconURL: 'https://i.imgur.com/uA9lFcz.png' });

				return await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ] });
			} else {
				const responseData = await getModFileChangelog(fetchedProject.id, fetchedProject.latestFilesIndexes[0].fileId, 5);
				let changelog = await getJSONResponse(responseData.body);
				changelog = changelog.data;

				const changelogNoHTML = changelog.replace(/<br>/g, '\n').replace(/<.*?>/g, '');

				const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
				const trimmedChangelog = trim(changelogNoHTML, 4000);

				const update = new MessageEmbed()
					.setColor('#f87a1b')
					.setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
					.setTitle(`${fetchedProject.name} has been updated`)
					.setDescription(`**Changelog:** ${codeBlock(trimmedChangelog)}`)
					.setThumbnail(`${fetchedProject.logo.url}`)
					.setFields(
						{ name: 'Version Name', value: `${fetchedProject.latestFilesIndexes[0].filename}` },
						{ name: 'Version Number', value: `${fetchedProject.latestFilesIndexes[0].filename}` },
						{ name: 'Release Type', value: `${releaseTypeToString(fetchedProject.latestFilesIndexes[0].releaseType)}` },
						{ name: 'Date Published', value: `${dayjs(fetchedProject.dateReleased).format('MMM D, YYYY h:mm A')}` },
					)
					.setTimestamp();

				const viewButton = new MessageButton()
					.setURL(`https://www.curseforge.com/minecraft/${classIdToUrlString(fetchedProject.classId)}/${fetchedProject.slug}/files/${fetchedProject.latestFilesIndexes[0].fileId}`)
					.setLabel('View on CurseForge')
					.setStyle('LINK');
				const row = new MessageActionRow().addComponents(viewButton);

				return await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ], components: [ row ] });
			}
		}
		case 'modrinth': {
			const versions = await listProjectVersions(fetchedProject.id);
			const fetchedVersion = await getJSONResponse(versions.body);

			let guildSettings = await GuildSettings.findOne({
				where: {
					guild_id: guild.id,
				},
			});
			if (!guildSettings) guildSettings = await GuildSettings.create({ guild_id: guild.id });

			if (guildSettings.is_lightweight_mode_enabled) {
				const update = new MessageEmbed()
					.setColor('DARK_GREEN')
					.setTitle(`${fetchedProject.title} ${fetchedVersion[0].version_number}`)
					.setURL(`https://modrinth.com/${fetchedProject.project_type}/${fetchedProject.slug}/version/${fetchedVersion[0].version_number}`)
					.setDescription(`${fetchedVersion[0].name} (${fetchedVersion[0].version_type})`)
					.setFooter({ text: `${dayjs(fetchedVersion[0].date_published).format('MMM D, YYYY h:mm A')}`, iconURL: 'https://i.imgur.com/2XDguyk.png' });

				return await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ] });
			} else {
				const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
				const trimmedDescription = trim(fetchedVersion[0].changelog, 4000);

				const update = new MessageEmbed()
					.setColor('DARK_GREEN')
					.setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
					.setTitle(`${fetchedProject.title} has been updated`)
					.setDescription(`**Changelog:** ${codeBlock(trimmedDescription)}`)
					.setThumbnail(`${fetchedProject.icon_url}`)
					.setFields(
						{ name: 'Version Name', value: `${fetchedVersion[0].name}` },
						{ name: 'Version Number', value: `${fetchedVersion[0].version_number}` },
						{ name: 'Release Type', value: `${fetchedVersion[0].version_type}` },
						{ name: 'Date Published', value: `${dayjs(fetchedVersion[0].date_published).format('MMM D, YYYY h:mm A')}` },
					)
					.setTimestamp();

				const viewButton = new MessageButton()
					.setURL(`https://modrinth.com/${fetchedProject.project_type}/${fetchedProject.slug}/version/${fetchedVersion[0].version_number}`)
					.setLabel('View on Modrinth')
					.setStyle('LINK');
				const row = new MessageActionRow().addComponents(viewButton);

				return await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ], components: [ row ] });
			}
		}
		}
	},
};