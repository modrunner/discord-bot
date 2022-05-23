const { SlashCommandBuilder } = require('@discordjs/builders');
const { request } = require('undici');
const { Projects } = require('./../dbObjects');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('track')
		.setDescription('Track a Modrinth project and get notified when it gets updated.')
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
		await interaction.deferReply();

		async function getJSONResponse(body) {
			let fullBody = '';

			for await (const data of body) {
				fullBody += data.toString();
			}

			return JSON.parse(fullBody);
		}

		const postChannel = interaction.options.getChannel('channel');

		const projectId = interaction.options.getString('projectid');
		const apiRequest = await request(`https://api.modrinth.com/v2/project/${projectId}`);
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
	},
};