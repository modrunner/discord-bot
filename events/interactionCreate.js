const { verifyMemberPermission } = require('../util/verifyPermissions');
const { Permissions, MessageEmbed } = require('discord.js');
const { trackProject } = require('../commands/track');
const { request } = require('undici');
const { getJSONResponse } = require('../util/getJSONResponse');
const { classIdToString } = require('../util/classIdToString');
const { inlineCode } = require('@discordjs/builders');
const { cf_api_key } = require('../config.json');
const logger = require('../logger');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		// Slash command interactions
		if (interaction.isCommand()) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				command.execute(interaction);
			} catch (error) {
				console.error(error);
				await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
			}
		} else if (interaction.isButton()) {
			if (interaction.customId.startsWith('track:')) {
				if (!verifyMemberPermission(Permissions.FLAGS.MANAGE_CHANNELS, interaction.member)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

				const projectId = interaction.customId.substring(6);
				await interaction.deferReply();
				trackProject(interaction, interaction.guild.channels.cache.find(element => element.id === interaction.channel.id), projectId);
			} else if (interaction.customId.startsWith('cf_track:')) {
				if (!verifyMemberPermission(Permissions.FLAGS.MANAGE_CHANNELS, interaction.member)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

				const projectId = interaction.customId.substring(9);
				await interaction.deferReply();
				trackProject(interaction, interaction.guild.channels.cache.find(element => element.id === interaction.channel.id), projectId);
			} else if (interaction.customId.startsWith('more:')) {
				await interaction.deferReply();

				try {
					const query = interaction.customId.substring(5);
					const searchTerm = new URLSearchParams({ query });
					const searchResult = await request(`https://api.modrinth.com/v2/search?${searchTerm}`);
					var { hits } = await getJSONResponse(searchResult.body);
				} catch (error) {
					logger.error(error);
					const errorEmbed = new MessageEmbed()
						.setColor('RED')
						.setTitle('⚠️ An error occured while processing your query.')
						.setDescription(`${error.message}`)
						.setFooter({ text: `${error.name}` });
					return await interaction.editReply({ embeds: [ errorEmbed ] });
				}

				const resultsList = new MessageEmbed()
					.setColor('DARK_GREEN')
					.setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
					.setTitle(`Results for ${inlineCode(interaction.customId.substring(5))}`)
					.setDescription(`${hits.length} total results`)
					.setFooter({ text: 'NOTE: To see more than 25 results, or if you don\'t see what you\'re trying to find here, try searching on Modrinth\'s website.' });

				for (let i = 0; i < hits.length; i++) {
					if (i > 25) return interaction.editReply({ embeds: [ resultsList ] });

					resultsList.addFields({ name: `${hits[i].title}`, value: `[[View](https://modrinth.com/${hits[i].project_type}/${hits[i].slug})] ${hits[i].project_type}, ${hits[i].downloads} downloads` });
				}

				return await interaction.editReply({ embeds: [ resultsList ] });
			} else if (interaction.customId.startsWith('cf_more:')) {
				await interaction.deferReply();

				try {
					const query = interaction.customId.substring(8);
					const searchTerm = new URLSearchParams({ query });
					const searchResult = await request(`https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${searchTerm}`, { headers: { 'x-api-key': cf_api_key } });
					var results = await getJSONResponse(searchResult.body);
				} catch (error) {
					logger.error(error);
					const errorEmbed = new MessageEmbed()
						.setColor('RED')
						.setTitle('⚠️ An error occured while processing your query.')
						.setDescription(`${error.message}`)
						.setFooter({ text: `${error.name}` });
					return await interaction.editReply({ embeds: [ errorEmbed ] });
				}

				const resultsList = new MessageEmbed()
					.setColor('#f87a1b')
					.setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
					.setTitle(`Results for ${inlineCode(interaction.customId.substring(8))}`)
					.setDescription(`${results.data.length} total results`)
					.setFooter({ text: 'NOTE: To see more than 25 results, or if you don\'t see what you\'re trying to find here, try searching on CurseForge\'s website.' });

				let num = 0;
				for (let i = results.data.length - 1; i >= 0; i--) {
					num++;
					if (num > 25) return interaction.editReply({ embeds: [ resultsList ] });

					resultsList.addFields({ name: `${results.data[i].name}`, value: `[[View](${results.data[i].links.websiteUrl})] ${classIdToString(results.data[i].classId)}, ${results.data[i].downloadCount} downloads` });
				}

				return await interaction.editReply({ embeds: [ resultsList ] });
			}
		}
	},

};
