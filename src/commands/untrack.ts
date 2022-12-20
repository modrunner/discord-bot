import { SlashCommandBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../prisma.js';
import logger from '../logger.js';

export default {
  data: new SlashCommandBuilder()
    .setName('untrack')
    .setDescription('Remove a project from tracking.')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addStringOption((option) => option.setName('projectid').setDescription('The ID of the project to stop tracking.'))
    .addChannelOption((option) => option.setName('channel').setDescription('The channel to stop updates being posted to.')),
  async execute(interaction: ChatInputCommandInteraction) {
    const projectId = interaction.options.getString('projectid');
    const channel = interaction.options.getChannel('channel');
    if (!interaction.guild) return;

    await interaction.deferReply();

    logger.info(`User ${interaction.user.tag} (${interaction.user.id}) sent an untrack request.`);

    if (channel && projectId) {
      const project = await Projects.fetch(projectId);
      if (!project) return await interaction.editReply(':x: That project does not exist.');

      const curseforgeUntrackedProjects = await prisma.curseforgeTrackedProject.deleteMany({
        where: {
          guildId: interaction.guild.id,
          channelId: channel.id,
          projectId: projectId,
        },
      });

      const modrinthUntrackedProjects = await prisma.modrinthTrackedProject.deleteMany({
        where: {
          guildId: interaction.guild.id,
          projectId: projectId,
          channelId: channel.id,
        },
      });

      if (curseforgeUntrackedProjects || modrinthUntrackedProjects)
        return await interaction.editReply(`:warning: Project **${project.name}** is not being tracked in ${channel}.`);
      return await interaction.editReply(`:white_check_mark: Successfully removed project **${project.name}** from tracking in channel ${channel}.`);
    } else if (channel) {
      const curseforgeUntrackedProjects = await prisma.curseforgeTrackedProject.deleteMany({
        where: {
          guildId: interaction.guild.id,
          channelId: channel.id,
        },
      });
      const modrinthUntrackedProjects = await prisma.modrinthTrackedProject.deleteMany({
        where: {
          guildId: interaction.guild.id,
          channelId: channel.id,
        },
      });
      if (curseforgeUntrackedProjects || modrinthUntrackedProjects)
        return await interaction.editReply(`:warning: There aren't any projects being tracked in ${channel}.`);
      return await interaction.editReply(
        `:white_check_mark: Successfully removed **${curseforgeUntrackedProjects.count + modrinthUntrackedProjects.count}** from tracking in ${channel}.`
      );
    } else if (projectId) {
      const project = await Projects.fetch(projectId);
      if (!project) return await interaction.editReply(':x: That project does not exist.');

      const curseforgeUntrackedProjects = await prisma.curseforgeTrackedProject.deleteMany({
        where: {
          guildId: interaction.guild.id,
          projectId: projectId,
        },
      });
      const modrinthUntrackedProjects = await prisma.modrinthTrackedProject.deleteMany({
        where: {
          guildId: interaction.guild.id,
          projectId: projectId,
        },
      });
      if (curseforgeUntrackedProjects || modrinthUntrackedProjects)
        return await interaction.editReply(`:warning: Project **${project.name}** is not being tracked in this server.`);
      return await interaction.editReply(`:white_check_mark: Successfully removed project **${project.name}** from tracking from all channels.`);
    } else {
      const confirmDialog = await interaction.editReply({
        content: ':warning: **WARNING** This will untrack every project being tracked in this server. Are you sure this is what you want to do?',
        components: [
          new ActionRowBuilder().addComponents([
            new ButtonBuilder()
              .setCustomId('confirm')
              //.setEmoji(':white_check_mark:')
              .setStyle(ButtonStyle.Success)
              .setLabel("Yes, I'm sure"),
            new ButtonBuilder()
              .setCustomId('cancel')
              //.setEmoji(':warning:')
              .setStyle(ButtonStyle.Danger)
              .setLabel('No, cancel'),
          ]),
        ],
      });

      const filter = (i) => {
        i.deferUpdate();
        return i.user.id === interaction.user.id;
      };
      const buttonInteraction = await confirmDialog
        .awaitMessageComponent({
          filter,
          componentType: ComponentType.Button,
          time: 30_000,
        })
        .catch(() => logger.debug('Time expired on untrack confirmation dialog.'));

      await interaction.editReply({ components: [] });

      if (buttonInteraction && buttonInteraction.customId === 'confirm') {
        logger.debug('Untrack request confirmed.');

        const untrackedProjects = await TrackedProjects.destroy({
          where: {
            guildId: interaction.guild.id,
          },
        });

        return await interaction.editReply(`:white_check_mark: Successfully removed **${untrackedProjects}** from tracking in this server.`);
      } else {
        logger.debug('Untrack request cancelled.');
        return await interaction.editReply('Untrack request cancelled. No projects were untracked.');
      }
    }
  },
};
