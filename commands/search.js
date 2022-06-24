const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { request } = require('undici');
const dayjs = require('dayjs');
const { getJSONResponse } = require('./../util/getJSONResponse');
const { classIdToString } = require('../util/classIdToString');
const { cf_api_key } = require('./../config.json');
const logger = require('../logger');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('Search for a project on popular mod hosting sites')
		.addSubcommand(subcommand =>
			subcommand
				.setName('curseforge')
				.setDescription('Search for a project on CurseForge')
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription('The query to search for')
						.setRequired(true),
				),
		)
		.addSubcommand(subcommand =>
			subcommand
				.setName('modrinth')
				.setDescription('Search for a project on Modrinth')
				.addStringOption(option =>
					option
						.setName('query')
						.setDescription('The query to search for')
						.setRequired(true),
				),
		),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'curseforge') {
			await interaction.deferReply();

			const query = interaction.options.getString('query');
			const searchTerm = new URLSearchParams({ query });

			try {
				const searchResult = await request(`https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${searchTerm}`, { headers: { 'x-api-key': cf_api_key } });
				var results = await getJSONResponse(searchResult.body);
			} catch (error) {
				logger.error(error);
				const errorEmbed = new MessageEmbed()
					.setColor('RED')
					.setTitle('⚠️ An error occured while processing your query.')
					.setDescription(`${error.message}`)
					.setFooter({ text: `${error.name}` });
				return await interaction.editReply({ embeds: [ errorEmbed ] });
			}

			if (!results.data.length) {
				return interaction.editReply(`No results found for **${query}**`);
			}

			const result = results.data[results.data.length - 1];
			const embed = new MessageEmbed()
				.setColor('#f87a1b')
				.setAuthor({ name: 'From curseforge.com', iconURL: 'https://i.imgur.com/uA9lFcz.png', url: 'https://curseforge.com' })
				.setTitle(result.name)
				.setDescription(result.summary)
				.setThumbnail(result.logo.url)
				.setFields(
					{ name: 'Project Type', value: `${classIdToString(result.classId)}` },
					{ name: 'Author', value: `${result.authors[0].name}` },
					{ name: 'Downloads', value: `${result.downloadCount}` },
					{ name: 'Last Updated', value: `${dayjs(result.dateReleased).format('MMM D, YYYY')}` },
					{ name: 'Project ID', value: `${result.id}` },
				);
			if (result.screenshots.length) embed.setImage(result.screenshots[Math.floor(Math.random() * result.screenshots.length)].url);

			const trackButton = new MessageButton()
				.setCustomId(`cf_track:${result.id}`)
				.setLabel('Track Project')
				.setStyle('PRIMARY');
			const moreResultsButton = new MessageButton()
				.setCustomId(`cf_more:${query}`)
				.setLabel('View More Results')
				.setStyle('SUCCESS');
			const viewButton = new MessageButton()
				.setURL(result.links.websiteUrl)
				.setLabel('View on CurseForge')
				.setStyle('LINK');
			const row = new MessageActionRow().addComponents(trackButton, moreResultsButton, viewButton);

			await interaction.editReply({ embeds: [ embed ], components: [ row ] });

		} else if (interaction.options.getSubcommand() === 'modrinth') {
			await interaction.deferReply();

			const query = interaction.options.getString('query');
			const searchTerm = new URLSearchParams({ query });

			try {
				const searchResult = await request(`https://api.modrinth.com/v2/search?${searchTerm}`);
				var { hits } = await getJSONResponse(searchResult.body);
			} catch (error) {
				logger.error(error);
				const errorEmbed = new MessageEmbed()
					.setColor('RED')
					.setTitle('⚠️ An error occured while processing your query.')
					.setDescription(`${error.message}`)
					.setFooter({ text: `${error.name}` });
				return await interaction.editReply({ embeds: [ errorEmbed ] });
			}

			if (!hits.length) {
				return await interaction.editReply(`No results found for **${query}**`);
			}

			const result = hits[0];
			const embed = new MessageEmbed()
				.setColor('DARK_GREEN')
				.setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
				.setTitle(result.title)
				.setDescription(result.description)
				.setThumbnail(result.icon_url)
				.setImage(result.gallery[Math.floor(Math.random() * result.gallery.length)])
				.setFields(
					{ name: 'Project Type', value: `${result.project_type}` },
					{ name: 'Author', value: `${result.author}` },
					{ name: 'Downloads', value: `${result.downloads}` },
					{ name: 'Last Updated', value: `${dayjs(hits[0].date_modified).format('MMM D, YYYY')}` },
					{ name: 'Project ID', value: `${result.project_id}` },
				);
			const trackButton = new MessageButton()
				.setCustomId(`track:${result.project_id}`)
				.setLabel('Track Project')
				.setStyle('PRIMARY');
			const moreResultsButton = new MessageButton()
				.setCustomId(`more:${query}`)
				.setLabel('View More Results')
				.setStyle('SUCCESS');
			const viewButton = new MessageButton()
				.setURL(`https://modrinth.com/${hits[0].project_type}/${hits[0].slug}`)
				.setLabel('View on Modrinth')
				.setStyle('LINK');
			const row = new MessageActionRow().addComponents(trackButton, moreResultsButton, viewButton);

			await interaction.editReply({ embeds: [ embed ], components: [ row ] });
		}
	},
};