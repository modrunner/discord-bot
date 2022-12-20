import { Guild } from 'discord.js';
import logger from '../logger.js';
import { database } from '../prisma.js';

export default {
  name: 'guildCreate',
  async execute(guild: Guild) {
    logger.debug('guildCreate event fired');
    // Add settings to database for guild
    await database.guild.create({
      data: {
        id: guild.id,
      },
    });

    logger.info(`Client was invited to guild ${guild.name} (${guild.id}). Initialized settings.`);
  },
};
