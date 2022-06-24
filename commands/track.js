const { SlashCommandBuilder } = require('@discordjs/builders');
const { request } = require('undici');
const { verifyMemberPermission } = require('../util/verifyPermissions');
const { getJSONResponse } = require('./../util/getJSONResponse');
const { Projects } = require('./../dbObjects');
const { Permissions } = require('discord.js');
const { classIdToString } = require('../util/classIdToString');
const { cf_api_key } = require('../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Track a Modrinth or CurseForge project and get notified when it gets updated.')
		.addStringOption(option =>
			option
				.setName('projectid')
				.setDescription('Specify the project to track by its ID')
				.setRequired(true),
		)
		.addChannelOption(option =>
			option
				.setName('channel')
				.setDescription('Specify which channel you want project update notifications posted to.')
				.addChannelType(0)
				.addChannelType(5)
				.setRequired(true),
		),
	async execute(interaction) {
		if (!verifyMemberPermission(Permissions.FLAGS.MANAGE_CHANNELS, interaction.member)) return await interaction.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });

		await interaction.deferReply();
		await this.trackProject(interaction, interaction.options.getChannel('channel'), interaction.options.getString('projectid'));
	},
	async trackProject(interaction, channel, projectid) {
		const postChannel = channel;

		const projectId = projectid;

		let requestUrl = '';
		if (projectId.match(/[A-z]/)) {
			requestUrl = `https://api.modrinth.com/v2/project/${projectId}`;
			const apiRequest = await request(requestUrl);
			const fetchedProject = await getJSONResponse(apiRequest.body);

			// eslint-disable-next-line no-unused-vars
			const [project, created] = await Projects.findOrCreate({
				where: {
					project_id: fetchedProject.id,
					guild_id: interaction.guild.id,
				},
				defaults: {
					project_id: fetchedProject.id,
					project_type: fetchedProject.project_type,
					project_slug: fetchedProject.slug,
					project_title: fetchedProject.title,
					date_modified: fetchedProject.updated,
					guild_id: interaction.guild.id,
					post_channel: postChannel.id,
				},
			});

			if (created) return await interaction.editReply(`Project **${fetchedProject.title}** added to tracking. Updates will be posted in ${postChannel}.`);

			return await interaction.editReply(`Project **${fetchedProject.title}** is already being tracked. To change which channel this project's updates are posted in, untrack and re-track the project.`);
		} else {
			requestUrl = `https://api.curseforge.com/v1/mods/${projectId}`;
			const apiRequest = await request(requestUrl, { headers: { 'x-api-key': cf_api_key } });
			const fetchedProject = await getJSONResponse(apiRequest.body);

			// eslint-disable-next-line no-unused-vars
			const [project, created] = await Projects.findOrCreate({
				where: {
					project_id: fetchedProject.data.id,
					guild_id: interaction.guild.id,
				},
				defaults: {
					project_id: fetchedProject.data.id,
					project_type: classIdToString(fetchedProject.data.classId),
					project_slug: fetchedProject.data.slug,
					project_title: fetchedProject.data.name,
					date_modified: fetchedProject.data.dateReleased,
					guild_id: interaction.guild.id,
					post_channel: postChannel.id,
				},
			});

			if (created) return await interaction.editReply(`Project **${fetchedProject.data.name}** added to tracking. Updates will be posted in ${postChannel}.`);

			return await interaction.editReply(`Project **${fetchedProject.data.name}** is already being tracked. To change which channel this project's updates are posted in, untrack and re-track the project.`);
		}
	},
};