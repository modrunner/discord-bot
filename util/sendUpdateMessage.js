const { MessageEmbed } = require('discord.js');
const { getJSONResponse } = require('../util/getJSONResponse');
const { releaseTypeToString } = require('../util/releaseTypeToString');
const { request } = require('undici');
const dayjs = require('dayjs');

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
			await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ] });
			break;
		}
		case 'modrinth': {
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
			await guild.channels.cache.find(element => element.id === channel).send({ embeds: [ update ] });
			break;
		}
		}
	},
};