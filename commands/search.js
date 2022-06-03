const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton, Permissions } = require('discord.js');
const { request } = require('undici');
const dayjs = require('dayjs');
const { trackProject } = require('./track');
const { getJSONResponse } = require('./../util/getJSONResponse');
const { verifyMemberPermission } = require('../util/verifyPermissions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search for a project on Modrinth')
		.addStringOption(option =>
			option
				.setName('project')
				.setDescription('Search by project name or ID')
				.setRequired(true),
		),
	async execute(interaction) {
		await interaction.deferReply();

		const query = interaction.options.getString('project');
		const searchTerm = new URLSearchParams({ query });

		const searchResult = await request(`https://api.modrinth.com/v2/search?${searchTerm}`);
		const { hits } = await getJSONResponse(searchResult.body);

		if (!hits.length) {
			return await interaction.editReply(`No results found for **${query}**`);
		}

		const embed = new MessageEmbed()
			.setColor('DARK_GREEN')
			.setTitle(hits[0].title)
			.setDescription(hits[0].description)
			.setThumbnail(hits[0].icon_url)
			.setImage(hits[0].gallery[0])
			.setFields(
				{ name: 'Project Type', value: `${hits[0].project_type}` },
				{ name: 'Author', value: `${hits[0].author}` },
				{ name: 'Downloads', value: `${hits[0].downloads}` },
				{ name: 'Last Updated', value: `${dayjs(hits[0].date_modified).format('MMM D, YYYY')}` },
				{ name: 'Project ID', value: `${hits[0].project_id}` },
			);
		const trackButton = new MessageButton()
			.setCustomId('track:' + hits[0].project_id)
			.setLabel('Track Project')
			.setStyle('PRIMARY');
		const disabledTrackButton = new MessageButton()
			.setCustomId('reeeeeeeeeeeeeeeeeeeeee')
			.setLabel('Project Tracked')
			.setDisabled()
			.setStyle('PRIMARY');
		const viewButton = new MessageButton()
			.setURL(`https://modrinth.com/${hits[0].project_type}/${hits[0].slug}`)
			.setLabel('View on Modrinth')
			.setStyle('LINK');
		const row = new MessageActionRow().addComponents(trackButton, viewButton);

		await interaction.editReply({ embeds: [ embed ], components: [ row ] });

		const filter = i => i.customId.startsWith('track');
		const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 });
		console.log('Started new button collector.');

		const usedRow = new MessageActionRow().addComponents(disabledTrackButton, viewButton);
		const timedOutRow = new MessageActionRow().addComponents(viewButton);

		async function removeTrackButton() {
			await interaction.editReply({ components: [ timedOutRow ] });
		}
		setTimeout(removeTrackButton, 30000);

		collector.on('collect', async i => {
			if (i.customId.startsWith('track')) {
				if (!verifyMemberPermission(Permissions.FLAGS.MANAGE_CHANNELS, interaction.member)) return await i.reply({ content: 'You can only add projects to tracking if you have the \'Manage Channels\' permission.', ephemeral: true });
				await i.update({ content: 'Project Tracked', components: [ usedRow ] });
				trackProject(interaction, interaction.channel, hits[0].project_id);
			}
		});
		collector.on('end', collected => {
			console.log(`Collection ended. Size: ${collected.size}`);
		});

	},
};