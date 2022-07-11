const { SlashCommandBuilder, inlineCode } = require('@discordjs/builders');
const { verifyMemberPermission } = require('../util/verifyPermissions');
const { Projects } = require('./../dbObjects');
const { Permissions } = require('discord.js');
const { classIdToString } = require('../util/classIdToString');
const { getMod, getProject } = require('../api/apiMethods');
const getJSONResponse = require('../api/getJSONResponse');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Track a Modrinth or CurseForge project and get notified when it gets updated.')
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
				.addChannelType(0)
				.addChannelType(5)
				.setRequired(true),
		),
	async execute(interaction) {
		if (!verifyMemberPermission(Permissions.FLAGS.MANAGE_CHANNELS, interaction.member)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

		await interaction.deferReply();
		const trackRequest = await this.trackProject(interaction, interaction.options.getChannel('channel'), interaction.options.getString('projectid'));

		if (trackRequest.project.isCreated) return await interaction.editReply(`Project **${trackRequest.project.project_title}** added to tracking. Updates will be posted in ${trackRequest.project.post_channel}.`);
		return await interaction.editReply({ cotent: `Project **${trackRequest.project.project_title}** is already being tracked. To change which channel this project's updates are posted in, untrack and re-track the project.`, ephemeral: true });
	},
	async trackProject(interaction, channel, projectId) {
		if (projectId.match(/[A-z]/)) {
			// Modrinth
			const responseData = await getProject(projectId, 5);

			switch (responseData.statusCode) {
			case 200: {
				// OK
				const requestedProject = await getJSONResponse(responseData.body);

				// eslint-disable-next-line no-unused-vars
				const [project, isCreated] = await Projects.findOrCreate({
					where: {
						project_id: requestedProject.id,
						guild_id: interaction.guild.id,
					},
					defaults: {
						project_id: requestedProject.id,
						project_type: requestedProject.project_type,
						project_slug: requestedProject.slug,
						project_title: requestedProject.title,
						date_modified: requestedProject.updated,
						guild_id: interaction.guild.id,
						post_channel: channel.id,
					},
				});

				if (isCreated) return await interaction.editReply(`Project **${inlineCode(requestedProject.title)}** added to tracking. Its updates will be posted to ${channel}.`);
				return await interaction.editReply(`Project **${inlineCode(requestedProject.title)}** is already being tracked. To change which channel this project's updates are posted to, untrack and re-track the project.`);
			}
			case 404:
				// Not Found
				return await interaction.editReply({ content: 'No project exists with that ID. Double-check that the ID is correct.', ephemeral: true });
			default:
				// Error upon request
				return await interaction.editReply({ content: 'An error has occured. Please contact the developer of this application if this issue persists.', ephemeral: true });
			}
		} else {
			// CurseForge
			const responseData = await getMod(projectId, 5);

			switch (responseData.statusCode) {
			case 200: {
				// OK
				const requestedMod = await getJSONResponse(responseData.body);

				// eslint-disable-next-line no-unused-vars
				const [project, isCreated] = await Projects.findOrCreate({
					where: {
						project_id: requestedMod.data.id,
						guild_id: interaction.guild.id,
					},
					defaults: {
						project_id: requestedMod.data.id,
						project_type: classIdToString(requestedMod.data.classId),
						project_slug: requestedMod.data.slug,
						project_title: requestedMod.data.name,
						date_modified: requestedMod.data.dateReleased,
						guild_id: interaction.guild.id,
						post_channel: channel.id,
					},
				});

				if (isCreated) return await interaction.editReply(`Project **${inlineCode(requestedMod.data.name)}** added to tracking. Its updates will be posted to ${channel}.`);
				return await interaction.editReply(`Project **${inlineCode(requestedMod.data.name)}** is already being tracked. To change which channel this project's updates are posted to, untrack and re-track the project.`);
			}
			case 404:
				// Not Found
				return await interaction.editReply({ content: 'No project exists with that ID. Double-check that the ID is correct.', ephemeral: true });
			case 500:
				// Internal Server Error
				return await interaction.editReply({ content: 'CurseForge has encountered an Internal Server Error while processing your request.', ephemeral: true });
			default:
				// Error upon request
				return await interaction.editReply({ content: 'An error has occured. Please contact the developer of this application if this issue persists.', ephemeral: true });
			}
		}
	},
};