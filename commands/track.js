const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType } = require('discord-api-types/v10');
const { TrackedProjects } = require('./../dbObjects');
const { PermissionsBitField } = require('discord.js');
const { getMod, getProject } = require('../api/apiMethods');
const getJSONResponse = require('../api/getJSONResponse');
const logger = require('../logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Track a Modrinth or CurseForge project and get notified when it gets updated.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
		.addStringOption(option =>
			option
				.setName('projectid')
				.setDescription('The project\'s ID.')
				.setRequired(true),
		)
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('The channel you want project update notifications posted to.')
				.addChannelTypes(
					ChannelType.GuildText,
					ChannelType.GuildNews,
				)
				.setRequired(true),
		),
	async execute(interaction) {
		const projectId = interaction.options.getString('projectid');
		const channel = interaction.options.getChannel('channel');

		await interaction.deferReply();
		const trackRequest = await this.trackProject(projectId, channel.id, interaction.guild.id);

		logger.debug(`Tracking request for project ID ${projectId} completed. Success: ${trackRequest.success} | Reason: ${trackRequest.reason} | Project Title: ${trackRequest.projectTitle}`);

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
	},

	async trackProject(projectId, updateChannelId, guildId) {
		if (projectId.match(/[A-z]/)) {
			// Modrinth
			const responseData = await getProject(projectId);
			if (responseData) {
				if (responseData.statusCode === 200) {
					var requestedProject = await getJSONResponse(responseData.body);

					const dbProject = await TrackedProjects.findOne({
						where: {
							id: projectId,
						},
					});

					if (dbProject) {
						if (dbProject.guild_data.guilds.some(element => element.id === guildId)) {
							if (dbProject.guild_data.guilds.find(element => element.id === guildId).channels.includes(updateChannelId)) {
								return { success: false, reason: 'project_already_tracked_in_channel', projectTitle: requestedProject.title };
							} else {
								const newData = dbProject.guild_data;
								newData.guilds.find(element => element.id === guildId).channels.push(updateChannelId);

								await TrackedProjects.update({
									title: requestedProject.title,
									guild_data: newData,
								}, {
									where: {
										id: projectId,
									},
								});

								return { success: true, reason: 'new_channel_added', projectTitle: requestedProject.title };
							}
						} else {
							const newData = dbProject.guild_data;
							newData.guilds.push({
								id: guildId,
								channels: [
									updateChannelId,
								],
							});

							await TrackedProjects.update({
								title: requestedProject.title,
								guild_data: newData,
							}, {
								where: {
									id: projectId,
								},
							});

							return { success: true, reason: 'new_guild_added', projectTitle: requestedProject.title };
						}
					} else {
						await TrackedProjects.create({
							id: projectId,
							title: requestedProject.title,
							platform: 'modrinth',
							date_updated: requestedProject.updated,
							latestFileId: null,
							guild_data: {
								'guilds': [
									{
										'id': guildId,
										'channels': [
											updateChannelId,
										],
									},
								],
							},
						});
						return { success: true, reason: 'new_database_entry_added', projectTitle: requestedProject.title };
					}
				} else if (responseData.statusCode === 404) {
					return { success: false, reason: 'file_not_found' };
				} else {
					logger.warn(`Modrinth project track failure: a Get Project request to Modrinth returned a ${responseData.statusCode} status code.`);
					return { success: false, reason: 'api_error' };
				}
			} else {
				logger.warn('Modrinth project track failure: a connection could not be established to Modrinth\'s API.');
				return { success: false, reason: 'api_failure' };
			}
		} else {
			// CurseForge
			const responseData = await getMod(projectId);
			if (responseData) {
				if (responseData.statusCode === 200) {
					var requestedMod = await getJSONResponse(responseData.body);

					const dbProject = await TrackedProjects.findOne({
						where: {
							id: projectId,
						},
					});

					if (dbProject) {
						if (dbProject.guild_data.guilds.some(element => element.id === guildId)) {
							if (dbProject.guild_data.guilds.find(element => element.id === guildId).channels.includes(updateChannelId)) {
								return { success: false, reason: 'project_already_tracked_in_channel', projectTitle: requestedMod.data.name };
							} else {
								const newData = dbProject.guild_data;
								newData.guilds.find(element => element.id === guildId).channels.push(updateChannelId);

								await TrackedProjects.update({
									title: requestedMod.data.name,
									guild_data: newData,
								}, {
									where: {
										id: projectId,
									},
								});

								return { success: true, reason: 'new_channel_added', projectTitle: requestedMod.data.name };
							}
						} else {
							const newData = dbProject.guild_data;
							newData.guilds.push({
								id: guildId,
								channels: [
									updateChannelId,
								],
							});

							await TrackedProjects.update({
								title: requestedMod.data.name,
								guild_data: newData,
							}, {
								where: {
									id: projectId,
								},
							});

							return { success: true, reason: 'new_guild_added', projectTitle: requestedMod.data.name };
						}
					} else {
						await TrackedProjects.create({
							id: projectId,
							title: requestedMod.data.name,
							platform: 'curseforge',
							date_updated: requestedMod.data.dateReleased,
							latestFileId: requestedMod.data.latestFiles[requestedMod.data.latestFiles.length - 1],
							guild_data: {
								'guilds': [
									{
										'id': guildId,
										'channels': [
											updateChannelId,
										],
									},
								],
							},
						});

						return { success: true, reason: 'new_database_entry_added', projectTitle: requestedMod.data.name };
					}
				} else if (responseData.statusCode === 404) {
					return { success: false, reason: 'file_not_found' };
				} else {
					logger.warn(`CurseForge project track failure: a Get Mod request to CurseForge returned a ${responseData.statusCode} status code.`);
					return { success: false, reason: 'api_error' };
				}
			} else {
				logger.warn('CurseForge project track failure: a connection could not be established to CurseForge\'s API.');
				return { success: false, reason: 'api_failure' };
			}
		}
	},
};