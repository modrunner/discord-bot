import { ChatInputCommandInteraction, EmbedBuilder, ButtonBuilder, ActionRowBuilder, ButtonStyle, SlashCommandBuilder, inlineCode } from 'discord.js'
import dayjs from 'dayjs'

export default {
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
  async execute(interaction: ChatInputCommandInteraction) {
    if (interaction.options.getSubcommand() === 'curseforge') {
      await interaction.deferReply()

      const query = interaction.options.getString('query')

      if (query) {
        const response = await fetch(`https://api.curseforge.com/v1/mods/search?gameId=432&searchFilter=${new URLSearchParams({ query })}`).then(
          async (res) => await res.json()
        )

        if (!response.data.length) {
          return interaction.editReply(`❌ No results found for **${inlineCode(query)}**`)
        }

        const result = response.data[response.data.length - 1]
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
          )
        if (result.screenshots.length) embed.setImage(result.screenshots[Math.floor(Math.random() * result.screenshots.length)].url)

        const trackButton = new ButtonBuilder().setCustomId(`track:${result.id}`).setLabel('Track Project').setStyle(ButtonStyle.Primary)
        const moreResultsButton = new ButtonBuilder().setCustomId(`cf_more:${query}`).setLabel('View More Results').setStyle(ButtonStyle.Success)
        const viewButton = new ButtonBuilder().setURL(result.links.websiteUrl).setLabel('View on CurseForge').setStyle(ButtonStyle.Link)

        const row = new ActionRowBuilder().addComponents(trackButton, moreResultsButton, viewButton)

        await interaction.editReply({ embeds: [embed], components: [row] })
      }
    } else if (interaction.options.getSubcommand() === 'modrinth') {
      await interaction.deferReply()

      const query = interaction.options.getString('query')

      if (query) {
        const response = await fetch(`https://api.modrinth.com/v2/search?query=${new URLSearchParams({ query })}`).then(async (res) => await res.json())

        if (!response.length) {
          return await interaction.editReply(`❌ No results found for **${inlineCode(query)}**`)
        }

        const result = response.hits[0]
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
            { name: 'Last Updated', value: `${dayjs(response.hits[0].date_modified).format('MMM D, YYYY')}` },
            { name: 'Project ID', value: `${result.project_id}` }
          )
        const trackButton = new ButtonBuilder().setCustomId(`track:${result.project_id}`).setLabel('Track Project').setStyle(ButtonStyle.Primary)
        const moreResultsButton = new ButtonBuilder().setCustomId(`more:${query}`).setLabel('View More Results').setStyle(ButtonStyle.Success)
        const viewButton = new ButtonBuilder()
          .setURL(`https://modrinth.com/${response.hits[0].project_type}/${response.hits[0].slug}`)
          .setLabel('View on Modrinth')
          .setStyle(ButtonStyle.Link)
        const row = new ActionRowBuilder().addComponents(trackButton, moreResultsButton, viewButton)

        await interaction.editReply({ embeds: [embed], components: [row] })
      }
    }
  },
}

function classIdToString(classId: number) {
  switch (classId) {
    case 5:
      return 'Bukkit Plugin'
    case 6:
      return 'Mod'
    case 12:
      return 'Resource Pack'
    case 17:
      return 'World'
    case 4471:
      return 'Modpack'
    case 4546:
      return 'Customization'
    case 4559:
      return 'Addon'
    default:
      return 'Unknown'
  }
}
