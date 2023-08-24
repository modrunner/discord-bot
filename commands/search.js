const { SlashCommandBuilder, inlineCode } = require('@discordjs/builders');
const { EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle } = require('discord.js');
const dayjs = require('dayjs');
const getJSONResponse = require('../api/getJSONResponse');
const { searchMods } = require('../api/curseforge');
const { searchProjects } = require('../api/modrinth');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('search')
    .setDescription('Search for a project on popular mod hosting sites')
    .addSubcommand((subcommand) =>
      subcommand
        .setName('curseforge')
        .setDescription('Search for a project on CurseForge')
        .addStringOption((option) => option.setName('query').setDescription('The project to search for').setRequired(true))
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName('modrinth')
        .setDescription('Search for a project on Modrinth')
        .addStringOption((option) => option.setName('query').setDescription('The project to search for').setRequired(true))
    ),
  async execute(interaction) {
    if (interaction.options.getSubcommand() === 'curseforge') {
      await interaction.deferReply();

      const query = interaction.options.getString('query');

      const responseData = await searchMods(query);
      if (!responseData) {
        const errorEmbed = new EmbedBuilder()
          .setColor('Red')
          .setDescription(
            '⚠️ A connection to CurseForge could not be established.\nIf this happens frequently, please contact the developer of this application.'
          )
          .setTimestamp();
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const results = await getJSONResponse(responseData.body);

      if (!results.data.length) {
        return interaction.editReply(`❌ No results found for **${inlineCode(query)}**`);
      }

      const result = results.data[results.data.length - 1];
      const embed = new EmbedBuilder()
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
          { name: 'Project ID', value: `${result.id}` }
        );
      if (result.screenshots.length) embed.setImage(result.screenshots[Math.floor(Math.random() * result.screenshots.length)].url);

      const trackButton = new ButtonBuilder().setCustomId(`track:${result.id}`).setLabel('Track Project').setStyle(ButtonStyle.Primary);
      const moreResultsButton = new ButtonBuilder().setCustomId(`cf_more:${query}`).setLabel('View More Results').setStyle(ButtonStyle.Success);
      const viewButton = new ButtonBuilder().setURL(result.links.websiteUrl).setLabel('View on CurseForge').setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(trackButton, moreResultsButton, viewButton);

      await interaction.editReply({ embeds: [embed], components: [row] });
    } else if (interaction.options.getSubcommand() === 'modrinth') {
      await interaction.deferReply();

      const query = interaction.options.getString('query');

      const responseData = await searchProjects(query);
      if (!responseData) {
        const errorEmbed = new EmbedBuilder()
          .setColor('Red')
          .setDescription(
            '⚠️ A connection to Modrinth could not be established.\nIf this happens frequently, please contact the developer of this application.'
          )
          .setTimestamp();
        return await interaction.editReply({ embeds: [errorEmbed] });
      }

      const { hits } = await getJSONResponse(responseData.body);

      if (!hits.length) {
        return await interaction.editReply(`❌ No results found for **${inlineCode(query)}**`);
      }

      const result = hits[0];
      const embed = new EmbedBuilder()
        .setColor('DarkGreen')
        .setAuthor({ name: 'From modrinth.com', iconURL: 'https://i.imgur.com/2XDguyk.png', url: 'https://modrinth.com' })
        .setTitle(result.title)
        .setDescription(result.description)
        .setThumbnail(result.icon_url !== '' ? result.icon_url : null)
        .setImage(result.gallery[Math.floor(Math.random() * result.gallery.length)])
        .setFields(
          { name: 'Project Type', value: `${result.project_type}` },
          { name: 'Author', value: `${result.author}` },
          { name: 'Downloads', value: `${result.downloads}` },
          { name: 'Last Updated', value: `${dayjs(hits[0].date_modified).format('MMM D, YYYY')}` },
          { name: 'Project ID', value: `${result.project_id}` }
        );
      const trackButton = new ButtonBuilder().setCustomId(`track:${result.project_id}`).setLabel('Track Project').setStyle(ButtonStyle.Primary);
      const moreResultsButton = new ButtonBuilder().setCustomId(`more:${query}`).setLabel('View More Results').setStyle(ButtonStyle.Success);
      const viewButton = new ButtonBuilder()
        .setURL(`https://modrinth.com/${hits[0].project_type}/${hits[0].slug}`)
        .setLabel('View on Modrinth')
        .setStyle(ButtonStyle.Link);
      const row = new ActionRowBuilder().addComponents(trackButton, moreResultsButton, viewButton);

      await interaction.editReply({ embeds: [embed], components: [row] });
    }
  },
};

function classIdToString(classId) {
  switch (classId) {
    case 5:
      return 'Bukkit Plugin';
    case 6:
      return 'Mod';
    case 12:
      return 'Resource Pack';
    case 17:
      return 'World';
    case 4471:
      return 'Modpack';
    case 4546:
      return 'Customization';
    case 4559:
      return 'Addon';
    default:
      return 'Unknown';
  }
}
