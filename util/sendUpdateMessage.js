const { MessageEmbed, MessageButton, MessageActionRow } = require('discord.js');
const { releaseTypeToString } = require('../util/releaseTypeToString');
const { listProjectVersions } = require('../api/apiMethods');
const dayjs = require('dayjs');
const getJSONResponse = require('../api/getJSONResponse');
const classIdToUrlString = require('../util/classIdToUrlString');

module.exports = {
	async sendUpdateMessage(fetchedProject, guild, channel, fetchedProjectPlatform) {
		switch (fetchedProjectPlatform) {
		case 'curseforge': {
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

			const viewButton = new MessageButton()
				.setURL(`https://www.curseforge.com/minecraft/${classIdToUrlString(fetchedProject.classId)}/${fetchedProject.slug}/files/${fetchedProject.latestFilesIndexes[0].fileId}`)
				.setLabel('View on CurseForge')
				.setStyle('LINK');
			const row = new MessageActionRow().addComponents(viewButton);

			await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ], components: [ row ] });
			break;
		}
		case 'modrinth': {
			const versions = await listProjectVersions(fetchedProject.id);
			const fetchedVersion = await getJSONResponse(versions.body);

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

			const viewButton = new MessageButton()
				.setURL(`https://modrinth.com/${fetchedProject.project_type}/${fetchedProject.slug}/version/${fetchedVersion[0].version_number}`)
				.setLabel('View on Modrinth')
				.setStyle('LINK');
			const row = new MessageActionRow().addComponents(viewButton);

			await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ], components: [ row ] });
			break;
		}
		}
	},
};