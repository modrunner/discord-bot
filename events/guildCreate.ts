import { Guild } from 'discord.js'
import { logger } from '../logger.js'

export default {
  name: 'guildCreate',
  async execute(guild: Guild) {
    logger.info(`Client joined guild ${guild.name} (${guild.id})`);
		// TODO request engine intitalize settings for guild
  },
};
