import { PermissionsBitField, SlashCommandBuilder, inlineCode, ChatInputCommandInteraction } from 'discord.js';
import prisma from '../prisma.js';

export default {
  data: new SlashCommandBuilder()
    .setName('settings')
    .setDescription("Modify Modrunner's settings for your server.")
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
    .addIntegerOption((option) =>
      option
        .setName('changelog_length')
        .setDescription('The maximum allowed length of changelogs, in number of characters. Defaults to 4000.')
        .setMaxValue(4000)
        .setMinValue(3)
    )
    .addStringOption((option) =>
      option.setName('notification_style').setDescription('Choose from several predefined project update notification styles. Defaults to Normal.').addChoices(
        {
          name: 'Normal',
          value: 'normal',
        },
        {
          name: 'Compact',
          value: 'compact',
        }
      )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const changelogLength = interaction.options.getInteger('changelog_length');
    const notificationStyle = interaction.options.getString('notification_style');
    if (!interaction.guild) return;
    let guildSettings = await prisma.discordGuild.findUnique({
      where: {
        id: interaction.guild.id,
      },
    });
    if (!guildSettings) {
      guildSettings = await prisma.discordGuild.create({
        data: {
          id: interaction.guild.id,
        },
      });
    }

    if (changelogLength) {
      await prisma.discordGuild.update({
        where: {
          id: interaction.guild.id,
        },
        data: {
          changelogMaxLength: changelogLength,
        },
      });
    }
    if (notificationStyle) {
      await prisma.discordGuild.update({
        where: {
          id: interaction.guild.id,
        },
        data: {
          notificationStyle: notificationStyle,
        },
      });
    }

    return await interaction.editReply(`:white_check_mark: Saved your server's settings as:
			:gear: Maximum changelog length: ${inlineCode(changelogLength ? changelogLength.toString() : guildSettings.changelogMaxLength.toString())}
			:gear: Notification style: ${inlineCode(notificationStyle ?? guildSettings.notificationStyle)}
			`);
  },
};
