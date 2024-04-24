import { Guild } from 'discord.js'
import { logger } from '../logger.js'

export default {
  name: 'guildDelete',
  async execute(guild: Guild) {
    logger.info(`Client left guild ${guild.name} (${guild.id})`)
    fetch(`${process.env.ENGINE_BASE_URL}/discord_guild`, {
      method: 'DELETE',
      body: JSON.stringify({
        id: guild.id,
      }),
    }).catch((error: any) => logger.error(error))
  },
}
