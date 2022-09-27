const { SlashCommandBuilder, EmbedBuilder, inlineCode } = require('discord.js');
const { TrackedProjects } = require('../dbObjects');
const logger = require('../logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('list')
		.setDescription('Get a list of all the projects currently in tracking.'),
	async execute(interaction) {
		await interaction.deferReply();

		const projects = await TrackedProjects.findAll();
		let guildProjects = new Array;

		for (const project of projects) {
			for (let i = 0; i < project.guild_data.guilds.length; i++) {
				if (project.guild_data.guilds.at(i).id === interaction.guild.id) {
					guildProjects.push(project);
				}
			}
		}
		logger.debug(`guild has ${guildProjects.length} projects`);

		guildProjects = guildProjects.sort((a, b) => a.title.localeCompare(b.title));

		const page1 = new EmbedBuilder()
			.setColor('DarkGreen')
			.setTitle(`Projects currently being tracked in ${interaction.guild.name}`)
			.setDescription(`Projects are not listed in any particular order.\nTo manage your tracked projects, use the ${inlineCode('/track')} and ${inlineCode('/untrack')} commands.`)
			.setFooter({ text: 'Page 1' });

		const page2 = new EmbedBuilder().setColor('DarkGreen').setFooter({ text: 'Page 2' });
		const page3 = new EmbedBuilder().setColor('DarkGreen').setFooter({ text: 'Page 3' });
		const page4 = new EmbedBuilder().setColor('DarkGreen').setFooter({ text: 'Page 4' });

		for (let i = 0; i < guildProjects.length; i++) {
			const channels = new Array;
			for (let j = 0; j < guildProjects.at(i).guild_data.guilds.length; j++) {
				if (guildProjects.at(i).guild_data.guilds.at(j).id === interaction.guild.id) {
					for (const channel of guildProjects.at(i).guild_data.guilds.at(j).channels) {
						channels.push(channel);
					}
				}
			}

			let listChannels = new Array;
			for (const channel of channels) {
				const listChannel = interaction.guild.channels.cache.get(channel);
				listChannels.push(listChannel);
			}
			listChannels = listChannels.join(', ');
			const field = { name: `${guildProjects.at(i).title} (${guildProjects.at(i).id})`, value: `${listChannels}`, inline: false };

			if (i >= 0 && i < 25) {
				page1.addFields(field);
			} else if (i >= 25 && i < 50) {
				page2.addFields(field);
			} else if (i >= 50 && i < 75) {
				page3.addFields(field);
			} else if (i >= 75 && i < 100) {
				page4.addFields(field);
			}
		}
		const pages = { embeds: [ page1 ] };
		if (guildProjects.length > 25) pages.embeds.push(page2);
		if (guildProjects.length > 50) pages.embeds.push(page3);
		if (guildProjects.length > 75) pages.embeds.push(page4);
		return await interaction.editReply(pages);
	},
};