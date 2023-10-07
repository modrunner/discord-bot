const { Guilds } = require('../database/db');
const logger = require('../logger');

module.exports = {
  name: 'guildCreate',
  async execute(guild) {
    logger.info(`Client was invited to guild ${guild.name} (${guild.id}).`);

    // Add settings to database for guild
    await Guilds.create({
      id: guild.id,
    });
    logger.info(`Initialized settings for guild ${guild.name} (${guild.id})`);
  },
};
