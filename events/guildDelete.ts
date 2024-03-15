import { Guild } from 'discord.js'
import { logger } from '../logger.js'

export default {
  name: 'guildDelete',
  async execute(guild: Guild) {
    logger.info(`Client left guild ${guild.name} (${guild.id})`);
		// TODO request engine to remove settings and tracked projects for guild
  },
};
