const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Projects, TrackedProjects } = require('../database/models');
const logger = require('../logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('untrack')
		.setDescription('Remove a project from tracking.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
		.addStringOption(option =>
			option
				.setName('projectid')
				.setDescription('The ID of the project to stop tracking.'),
		)
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('The channel to stop updates being posted to.'),
		),
	async execute(interaction) {
		const projectId = interaction.options.getString('projectid');
		const channel = interaction.options.getChannel('channel');

		await interaction.deferReply();

		logger.info(`User ${interaction.user.tag} (${interaction.user.id}) sent an untrack request.`);


		if (channel && projectId) {
			const project = await Projects.fetch(projectId);
			if (!project) return await interaction.editReply(':x: That project does not exist.');

			const untrackedProjects = await TrackedProjects.destroy({
				where: {
					guildId: interaction.guild.id,
					channelId: channel.id,
					projectId: projectId,
				},
			});
			if (untrackedProjects === 0) return await interaction.editReply(`:warning: Project **${project.name}** is not being tracked in ${channel}.`);
			return await interaction.editReply(`:white_check_mark: Successfully removed project **${project.name}** from tracking in channel ${channel}.`);
		} else if (channel) {
			const untrackedProjects = await TrackedProjects.destroy({
				where: {
					guildId: interaction.guild.id,
					channelId: channel.id,
				},
			});
			if (untrackedProjects === 0) return await interaction.editReply(`:warning: There aren't any projects being tracked in ${channel}.`);
			return await interaction.editReply(`:white_check_mark: Successfully removed **${untrackedProjects}** from tracking in ${channel}.`);
		} else if (projectId) {
			const project = await Projects.fetch(projectId);
			if (!project) return await interaction.editReply(':x: That project does not exist.');

			const untrackedProjects = await TrackedProjects.destroy({
				where: {
					guildId: interaction.guild.id,
					projectId: projectId,
				},
			});
			if (untrackedProjects === 0) return await interaction.editReply(`:warning: Project **${project.name}** is not being tracked in this server.`);
			return await interaction.editReply(`:white_check_mark: Successfully removed project **${project.name}** from tracking from all channels.`);
		} else {
			const untrackedProjects = await TrackedProjects.destroy({
				where: {
					guildId: interaction.guild.id,
				},
			});
			return await interaction.editReply(`:white_check_mark: Successfully removed **${untrackedProjects}** from tracking in this server.`);
		}
	},
};
