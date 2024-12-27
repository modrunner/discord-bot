const { PermissionsBitField, SlashCommandBuilder, inlineCode } = require('discord.js');
const { Guilds } = require('../database/db');

module.exports = {
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
          name: 'Normal - Alternate',
          value: 'alt',
        },
        {
          name: 'Compact',
          value: 'compact',
        },
        {
          name: 'AI-Generated (Beta)',
          value: 'ai',
        }
      )
    ),
  async execute(interaction) {
    await interaction.deferReply();
    const changelogLength = interaction.options.getInteger('changelog_length');
    const notificationStyle = interaction.options.getString('notification_style');
    const guildSettings = await Guilds.findByPk(interaction.guild.id);

    if (changelogLength) await guildSettings.setChangelogMaxLength(changelogLength);
    if (notificationStyle) await guildSettings.setNotificationStyle(notificationStyle);

    return await interaction.editReply(`:white_check_mark: Saved your server's settings as:
			:gear: Maximum changelog length: ${inlineCode(changelogLength ?? guildSettings.changelogLength)}
			:gear: Notification style: ${inlineCode(notificationStyle ?? guildSettings.notificationStyle)}
			`);
  },
};
