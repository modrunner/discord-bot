import { Guild } from 'discord.js'
import { logger } from '../logger.js'

export default {
  name: 'guildCreate',
  async execute(guild: Guild) {
    logger.info(`Client joined guild ${guild.name} (${guild.id})`)
    fetch(`${process.env.ENGINE_BASE_URL}/discord_guild`, {
      method: 'POST',
      body: JSON.stringify({
        id: guild.id,
        name: guild.name,
      }),
    }).catch((error: any) => logger.error(error))
  },
}
