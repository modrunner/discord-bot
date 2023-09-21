const { TrackedProjects } = require('../database/db');
const logger = require('../logger');

module.exports = {
  name: 'channelDelete',
  async execute(channel) {
    const deleted = await TrackedProjects.destroy({
      where: {
        guildId: channel.guild.id,
        channelId: channel.id,
      },
    });

    logger.info(
      `Channel #${channel.name} (${channel.id}) was deleted in guild ${channel.guild.name} (${channel.guild.id}). Removed ${deleted} projects from tracking as a result.`
    );
  },
};
