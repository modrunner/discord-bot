const { verifyMemberPermission } = require('../util/verifyPermissions');
const { PermissionsBitField, ApplicationCommandType, ComponentType, EmbedBuilder } = require('discord.js');
const { trackProject } = require('../commands/track');
const getJSONResponse = require('../api/getJSONResponse');
const { classIdToString } = require('../util/classIdToString');
const { inlineCode } = require('@discordjs/builders');
const { searchMods, searchProjects } = require('../api/apiMethods');
const logger = require('../logger');

module.exports = {
	name: 'interactionCreate',
	async execute(interaction) {
		// Slash command interactions
		if (interaction.commandType === ApplicationCommandType.ChatInput) {
			const command = interaction.client.commands.get(interaction.commandName);

			if (!command) return;

			try {
				command.execute(interaction);
			} catch (error) {
				logger.error(error);
				await interaction.reply({ content: 'There was an error while executing this command.', ephemeral: true });
			}
		} else if (interaction.componentType === ComponentType.Button) {
			if (interaction.customId.startsWith('track:')) {
				if (!verifyMemberPermission(PermissionsBitField.Flags.ManageChannels, interaction.member)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

				const projectId = interaction.customId.substring(6);
				await interaction.deferReply();
				trackProject(interaction, interaction.guild.channels.cache.find(element => element.id === interaction.channel.id), projectId);
			} else if (interaction.customId.startsWith('cf_track:')) {
				if (!verifyMemberPermission(PermissionsBitField.Flags.ManageChannels, interaction.member)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

				const projectId = interaction.customId.substring(9);
				await interaction.deferReply();
				trackProject(interaction, interaction.guild.channels.cache.find(element => element.id === interaction.channel.id), projectId);
			} else if (interaction.customId.startsWith('more:')) {
				await interaction.deferReply();

				const query = interaction.customId.substring(5);
				const responseData = await searchProjects(query, 5);
				if (!responseData) {
					const errorEmbed = new EmbedBuilder()
						.setColor('RED')
						.setDescription('⚠️ A connection to Modrinth could not be established.\nIf this happens frequently, please contact the developer of this application.')
						.setTimestamp();
					return await interaction.editReply({ embeds: [ errorEmbed ] });
				}

				const searchResults = await getJSONResponse(responseData.body);

				const resultsList = new EmbedBuilder()
					.setColor('DARK_GREEN')
					.setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
					.setTitle(`Results for ${inlineCode(interaction.customId.substring(5))}`)
					.setDescription(`${searchResults.hits.length} total results`)
					.setFooter({ text: 'NOTE: To see more than 25 results, or if you don\'t see what you\'re trying to find here, try searching on Modrinth\'s website.' });

				for (let i = 0; i < searchResults.hits.length; i++) {
					if (i > 25) return interaction.editReply({ embeds: [ resultsList ] });

					resultsList.addFields({ name: `${searchResults.hits[i].title}`, value: `[[View](https://modrinth.com/${searchResults.hits[i].project_type}/${searchResults.hits[i].slug})] ${searchResults.hits[i].project_type}, ${searchResults.hits[i].downloads} downloads` });
				}

				return await interaction.editReply({ embeds: [ resultsList ] });

			} else if (interaction.customId.startsWith('cf_more:')) {
				await interaction.deferReply();

				const query = interaction.customId.substring(8);

				const responseData = await searchMods(query, 5);
				if (!responseData) {
					const errorEmbed = new EmbedBuilder()
						.setColor('RED')
						.setDescription('⚠️ A connection to CurseForge could not be established.\nIf this happens frequently, please contact the developer of this application.')
						.setTimestamp();
					return await interaction.editReply({ embeds: [ errorEmbed ] });
				}

				const searchResults = await getJSONResponse(responseData.body);

				const resultsList = new EmbedBuilder()
					.setColor('#f87a1b')
					.setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
					.setTitle(`Results for ${inlineCode(interaction.customId.substring(8))}`)
					.setDescription(`${searchResults.data.length} total results`)
					.setFooter({ text: 'NOTE: To see more than 25 results, or if you don\'t see what you\'re trying to find here, try searching on CurseForge\'s website.' });

				let num = 0;
				for (let i = searchResults.data.length - 1; i >= 0; i--) {
					num++;
					if (num > 25) return interaction.editReply({ embeds: [ resultsList ] });

					resultsList.addFields({ name: `${searchResults.data[i].name}`, value: `[[View](${searchResults.data[i].links.websiteUrl})] ${classIdToString(searchResults.data[i].classId)}, ${searchResults.data[i].downloadCount} downloads` });
				}

				return await interaction.editReply({ embeds: [ resultsList ] });
			}
		}
	},

};
