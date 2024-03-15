import { DMChannel, GuildChannel } from 'discord.js'
import { logger } from '../logger.js'

export default {
  name: 'channelDelete',
  async execute(channel: DMChannel | GuildChannel) {
    if (channel instanceof GuildChannel) {
      // TODO request the engine delete all tracked projects for this channel
    }
  },
}
