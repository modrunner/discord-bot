const { PermissionsBitField, ApplicationCommandType, ComponentType, EmbedBuilder } = require('discord.js');
const { trackProject } = require('../commands/track');
const getJSONResponse = require('../api/getJSONResponse');
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
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

				const projectId = interaction.customId.substring(6);
				const channel = interaction.guild.channels.cache.find(element => element.id === interaction.channel.id);
				await interaction.deferReply();
				const trackRequest = await trackProject(projectId, channel.id, interaction.guild.id);

				if (trackRequest.success) {
					switch (trackRequest.reason) {
					case 'new_database_entry_added':
						return await interaction.editReply(`✅ Project **${trackRequest.projectTitle}** added to tracking. Updates will be posted in ${channel}.`);
					case 'new_guild_added':
						return await interaction.editReply(`✅ Project **${trackRequest.projectTitle}** added to tracking. Updates will be posted in ${channel}.`);
					case 'new_channel_added':
						return await interaction.editReply(`✅ Project **${trackRequest.projectTitle}** will now additionally have updates posted in ${channel}.`);
					}
				} else {
					switch (trackRequest.reason) {
					case 'project_already_tracked_in_channel':
						return await interaction.editReply(`⚠️ Project **${trackRequest.projectTitle}** is already posting updates to channel ${channel}.`);
					case 'file_not_found':
						return await interaction.editReply(`⚠️ No project exists with ID **${projectId}**.`);
					case 'api_error':
						return await interaction.editReply('❌ An error occured, please try again.\nIf this issue persists, please contact the developer of this application. `(API_ERROR)`');
					case 'api_failure':
						return await interaction.editReply('❌ An error occured, please try again.\nIf this issue persists, please contact the developer of this application. `(API_FAILURE)`');
					}
				}
			} else if (interaction.customId.startsWith('cf_track:')) {
				if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageChannels)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

				const projectId = interaction.customId.substring(9);
				const channel = interaction.guild.channels.cache.find(element => element.id === interaction.channel.id);
				await interaction.deferReply();
				const trackRequest = await trackProject(projectId, channel.id, interaction.guild.id);

				if (trackRequest.success) {
					switch (trackRequest.reason) {
					case 'new_database_entry_added':
						return await interaction.editReply(`✅ Project **${trackRequest.projectTitle}** added to tracking. Updates will be posted in ${channel}.`);
					case 'new_guild_added':
						return await interaction.editReply(`✅ Project **${trackRequest.projectTitle}** added to tracking. Updates will be posted in ${channel}.`);
					case 'new_channel_added':
						return await interaction.editReply(`✅ Project **${trackRequest.projectTitle}** will now additionally have updates posted in ${channel}.`);
					}
				} else {
					switch (trackRequest.reason) {
					case 'project_already_tracked_in_channel':
						return await interaction.editReply(`⚠️ Project **${trackRequest.projectTitle}** is already posting updates to channel ${channel}.`);
					case 'file_not_found':
						return await interaction.editReply(`⚠️ No project exists with ID **${projectId}**.`);
					case 'api_error':
						return await interaction.editReply('❌ An error occured, please try again.\nIf this issue persists, please contact the developer of this application. `(API_ERROR)`');
					case 'api_failure':
						return await interaction.editReply('❌ An error occured, please try again.\nIf this issue persists, please contact the developer of this application. `(API_FAILURE)`');
					}
				}
			} else if (interaction.customId.startsWith('more:')) {
				await interaction.deferReply();

				const query = interaction.customId.substring(5);
				const responseData = await searchProjects(query);
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

				const responseData = await searchMods(query);
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

function classIdToString(classId) {
	switch (classId) {
	case 5:
		return 'Bukkit Plugin';
	case 6:
		return 'Mod';
	case 12:
		return 'Resource Pack';
	case 17:
		return 'World';
	case 4471:
		return 'Modpack';
	case 4546:
		return 'Customization';
	case 4559:
		return 'Addon';
	default:
		return 'Unknown';
	}
}
