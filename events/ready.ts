import { ActivityType, Client } from 'discord.js'
import { CronJob } from 'cron'
import { logger } from './../logger.js'

export default {
  name: 'ready',
  async execute(client: Client) {
    logger.info('Client is ready to work')
    new CronJob(
      '* */10 * * * *',
      () => {
        // TODO call the engine for tracked project stats

        if (client.user) {
          client.user.setPresence({
            activities: [
              {
                type: ActivityType.Watching,
                name: `NULL projects for updates in ${client.guilds.cache.size} servers.`,
              },
            ],
            status: 'online',
          })
        }
      },
      null,
      true
    )
  },
}
