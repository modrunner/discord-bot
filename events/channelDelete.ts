import { DMChannel, GuildChannel } from 'discord.js'
import { logger } from '../logger.js'

export default {
  name: 'channelDelete',
  async execute(channel: DMChannel | GuildChannel) {
    if (channel instanceof GuildChannel) {
      fetch(`${process.env.ENGINE_BASE_URL}/discord_channel`, {
        method: 'POST',
        body: JSON.stringify({
          id: channel.id,
        }),
      }).catch((error: any) => logger.error(error))
    }
  },
}
