const { SlashCommandBuilder } = require('@discordjs/builders');
const { verifyMemberPermission } = require('../util/verifyPermissions');
const { Projects } = require('./../dbObjects');
const { Permissions } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('untrack')
		.setDescription('Remove a project from tracking.')
		.addStringOption(option =>
			option
				.setName('projectid')
				.setDescription('Enter the project by ID which you want to untrack')
				.setRequired(true),
		),
	async execute(interaction) {
		if (!verifyMemberPermission(Permissions.FLAGS.MANAGE_CHANNELS, interaction.member)) return await interaction.reply({ content: 'You can only remove projects from tracking if you have the \'Manage Channels\' permission.', ephemeral: true });
		const projectId = interaction.options.getString('projectid');

		const deleted = await Projects.destroy({
			where: {
				project_id: projectId,
				guild_id: interaction.guild.id,
			},
		});

		if (deleted) return await interaction.reply('Project has been removed from tracking.');

		return await interaction.reply('That project is not being tracked, therefore you cannot untrack it.');
	},
};