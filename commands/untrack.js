const { SlashCommandBuilder, PermissionsBitField, inlineCode } = require('discord.js');
const { TrackedProjects } = require('../dbObjects');
const logger = require('../logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('untrack')
		.setDescription('Remove a project from tracking.')
		.setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
		.addStringOption(option =>
			option
				.setName('projectid')
				.setDescription('Enter the project by ID which you want to untrack')
				.setRequired(true),
		)
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('The channel to stop updates being posted to.'),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const projectId = interaction.options.getString('projectid');
		const channel = interaction.options.getChannel('channel');

		const project = await TrackedProjects.findByPk(projectId);
		if (!project) return await interaction.editReply(`❌ There is no project being tracked with ID ${inlineCode(projectId)}.`);

		for (let i = 0; i < project.guild_data.guilds.length; i++) {
			const guild = project.guild_data.guilds.at(i);
			if (guild.id === interaction.guild.id) {
				if (channel) {
					for (let j = 0; j < guild.channels.length; j++) {
						if (guild.channels.at(j) === channel.id) {
							project.guild_data.guilds.at(i).channels.splice(j, 1);

							if (project.guild_data.guilds.at(i).channels.length === 0) {
								project.guild_data.guilds.splice(i, 1);

								if (project.guild_data.guilds.length === 0) {
									logger.debug('Untracked project. Project is no longer being followed in any guilds and has been removed from the database.');

									await TrackedProjects.destroy({
										where: {
											id: project.id,
										},
									});

									return await interaction.editReply(`✅ Project **${project.title}** has been removed from tracking.`);
								} else {
									logger.debug('Untracked project. Project is no longer being tracked in any channel in the current guild, so current guild information has been removed from the project database entry.');

									await TrackedProjects.update({
										guild_data: project.guild_data,
									}, {
										where: {
											id: project.id,
										},
									});

									return await interaction.editReply(`✅ Project **${project.title}** has been removed from tracking.`);
								}
							} else {
								logger.debug('Untracked project. Project is still being tracked in other channel(s).');

								await TrackedProjects.update({
									guild_data: project.guild_data,
								}, {
									where: {
										id: project.id,
									},
								});

								return await interaction.editReply(`✅ Project **${project.title}**'s updates are no longer being posted to ${channel}.`);
							}
						}
					}
					return await interaction.editReply(`⚠️ Project **${project.title}** is not posting updates to this channel.\nTo remove this project from all channels, do not specify a channel when using this command.`);
				} else {
					project.guild_data.guilds.splice(i, 1);

					if (project.guild_data.guilds.length === 0) {
						logger.debug('Untracked project. Project is no longer being followed in any guilds and has been removed from the database.');

						await TrackedProjects.destroy({
							where: {
								id: project.id,
							},
						});

						return await interaction.editReply(`✅ Project **${project.title}** has been removed from tracking.`);
					} else {
						logger.debug('Untracked project. Project is still being tracked in other guilds.');

						await TrackedProjects.update({
							guild_data: project.guild_data,
						}, {
							where: {
								id: project.id,
							},
						});

						return await interaction.editReply(`✅ Project **${project.title}** has been removed from tracking.`);
					}
				}
			}
		}
	},
};