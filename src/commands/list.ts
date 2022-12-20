import { Collection, SlashCommandBuilder, EmbedBuilder, inlineCode, ChannelType, ChatInputCommandInteraction, GuildBasedChannel } from 'discord.js';
import { database } from '../prisma.js';
import logger from '../logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('list')
    .setDescription('List all the projects that are currently tracked in your server.')
    .addChannelOption((option) =>
      option.setName('channel').setDescription('Filter results by channel').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
    )
    .addStringOption((option) =>
      option
        .setName('platform')
        .setDescription('Filter results by modding platform')
        .addChoices({ name: 'CurseForge', value: 'curseforge' }, { name: 'Modrinth', value: 'modrinth' })
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const channel = interaction.options.getChannel('channel');
    if (!interaction.guild) {
      return interaction.editReply(`
				Hi I'm Modrunner :wave:
				I have run into an error :x:
				But I know Haikus :writing_hand:
			`);
    }

    // Get all the tracked projects for this guild (or channel, if specified) from the database
    let curseforgeProjects: any[] = [];
    let modrinthProjects: any[] = [];
    if (channel) {
      curseforgeProjects = await database.curseforgeTrackedProject.findMany({
        where: {
          guildId: interaction.guild.id,
          channelId: channel.id,
        },
      });
      modrinthProjects = await database.modrinthTrackedProject.findMany({
        where: {
          guildId: interaction.guild.id,
          channelId: channel.id,
        },
      });

      logger.info(
        `${interaction.user.tag} (${interaction.user.id}) requested the tracked project list for guild ${interaction.guild.name} (${interaction.guild.id}) and channel #${channel.name} (${channel.id})`
      );
    } else {
      curseforgeProjects = await database.curseforgeTrackedProject.findMany({
        where: {
          guildId: interaction.guild.id,
        },
      });
      modrinthProjects = await database.modrinthTrackedProject.findMany({
        where: {
          guildId: interaction.guild.id,
        },
      });

      logger.info(
        `${interaction.user.tag} (${interaction.user.id}) requested the tracked project list for guild ${interaction.guild.name} (${interaction.guild.id})`
      );
    }

    // If the guild has no tracked projects
    if (curseforgeProjects.length + modrinthProjects.length === 0)
      return await interaction.editReply(
        `There aren't any projects currently tracked in this ${channel ? 'channel' : 'server'}. Add some by using the ${inlineCode('/track')} command!`
      );

    // Organize the data formatting so we can get every channel for each project
    const projectList: Collection<string, any> = new Collection();
    for (const project of curseforgeProjects) {
      if (projectList.has(project.projectId)) {
        const proj = projectList.get(project.projectId);
        proj.channels.push(project.channelId);
        projectList.set(project.projectId, proj);
      } else {
        let p = await database.curseforgeProject.findUnique({ where: { id: project.projectId } });
        p = await database.modrinthProject.findUnique({ where: { id: project.projectId } });
        const proj = { projectId: project.projectId, channels: [project.channelId], projectName: p.name };
        projectList.set(project.projectId, proj);
      }
    }

    const numberOfProjects = projectList.size;

    const guildSettings = await database.discordGuild.findUnique({
      where: {
        id: interaction.guild.id,
      },
    });

    // Sort the project list alphabetically
    projectList.sort((a: any, b: any) => a.projectName.localeCompare(b.projectName));

    // Create the number of required pages
    // The first page is special as it has the title and description so we make that separately
    const firstPage = new EmbedBuilder()
      .setColor('DarkGreen')
      .setTitle(`Projects currently tracked in ${channel ? channel.name : interaction.guild.name}`)
      .setDescription(
        `**Projects: ${projects.length}${channel ? '' : '/'}${
          channel ? '' : guildSettings.maxTrackedProjects
        }**\n\nProjects are listed alphabetically.\nTo manage your tracked projects, use the ${inlineCode('/track')} and ${inlineCode('/untrack')} commands.`
      )
      .setFooter({ text: 'Page 1' });
    const pagesToMake = Math.ceil((numberOfProjects - 25) / 25);

    logger.debug(
      `${interaction.user.tag} requested the tracked projects list for their guild ${
        interaction.guild.name
      }, which has ${numberOfProjects} projects tracked. Pages required: ${pagesToMake + 1}`
    );

    const embedPages = [firstPage];
    for (let i = 0; i < pagesToMake; i++) {
      const page = new EmbedBuilder().setColor('DarkGreen').setFooter({ text: `Page ${i + 2}` });
      embedPages.push(page);
    }

    // Add project information to appropriate page
    for (let i = 0; i < projectList.size; i++) {
      const pageToAddTo = Math.floor(i / 25);
      const channels: GuildBasedChannel[] = [];
      projectList.at(i).channels.forEach((channelId: string) => {
        channels.push(interaction.client.guilds.cache.get(interaction.guild.id).channels.cache.get(channelId));
      });
      embedPages[pageToAddTo].addFields({
        name: `${projectList.at(i).projectName} (${projectList.at(i).projectId})`,
        value: `${channels}`,
      });
    }

    await interaction.editReply({ embeds: embedPages });
  },
};
