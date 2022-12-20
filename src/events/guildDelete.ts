import { Guild } from 'discord.js';
import logger from '../logger.js';
import { database } from '../prisma.js';

export default {
  name: 'guildDelete',
  async execute(guild: Guild) {
    logger.debug('guildDelete event fired');
    // Remove this guild's settings from the database
    await database.guild.delete({
      where: {
        id: guild.id,
      },
    });

    // Remove this guild's tracked projects
    await database.trackedProject.deleteMany({
      where: {
        guildId: guild.id,
      },
    });

    logger.info(`Client left guild ${guild.name} (${guild.id}). Removed settings and tracked projects.`);
  },
};
