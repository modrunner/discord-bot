const { Guilds } = require('../database/models');
const logger = require('../logger');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
    // Add settings to database for guild
    await Guilds.create({
      id: guild.id,
    });

    logger.info(`Client was invited to guild ${guild.name} (${guild.id}). Initialized settings.`);
	},
};
