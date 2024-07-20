import express from 'express'
import { logger } from '../../logger.js'
import dayjs from 'dayjs'
import { EmbedBuilder, codeBlock } from 'discord.js'

export const notify = express.Router()

notify.route('/notify').post(async (request, response) => {
	// TODO checking the body to make sure it matches the shape of NotifyRequest[]
  const body: NotifyRequest[] = request.body
	const notificationResults: NotificationResult[] = []

  for (const notification of body) {
    for (const destination of notification.destinations) {
      if (destination.userId) {
        // TODO
      } else if (destination.channelId && destination.guildId) {
        const channel = request.app.locals.client.channels.cache.get(destination.channelId)
        const guild = request.app.locals.client.guilds.cache.get(destination.guildId)

        if (!channel || !guild) {
          logger.warn(`Received a notification request with ID "${destination.notificationId}" with either no valid channel ID or guild ID`)
					notificationResults.push({
						id: destination.notificationId,
						success: false,
					})
					continue
        }

        // TODO: modify notification based on guild settings
        const embed = new EmbedBuilder()
          .setAuthor(embedAuthorData(notification.project.platform))
          .setColor(embedColorData(notification.project.platform))
          .setDescription(`**Changelog**: ${codeBlock(trimChangelog(notification.version.changelog, 4000))}`)
          .setFields(
            {
              name: 'Version Name',
              value: notification.version.name,
            },
            {
              name: 'Version Number',
              value: `${notification.version.number}`,
            },
            {
              name: 'Release Type',
              value: `${notification.version.type}`,
            },
            {
              name: 'Date Published',
              value: `<t:${dayjs(notification.version.date).unix()}:f>`,
            }
          )
          .setThumbnail(notification.project.logoUrl)
          .setTimestamp()
          .setTitle(`${notification.project.name} has been updated`)

					try {
						await channel.send({ embeds: [embed] })
						notificationResults.push({
							id: destination.notificationId,
							success: true,
						})
					} catch (error) {
						logger.warn(`Error sending message to guild channel ${error}`)
						notificationResults.push({
							id: destination.notificationId,
							success: false,
						})
					}
      } else {
        logger.warn(`Received a notification request with ID "${destination.notificationId}" with no valid destination ID`)
				notificationResults.push({
					id: destination.notificationId,
					success: false,
				})
      }
    }

    response.status(200).json(notificationResults)
  }
})

interface NotifyRequest {
  project: {
    id: string
    name: string
    platform: string
    logoUrl: string
  }
  version: {
    id: string
    name: string
    number: string
    date: Date
    changelog: string
    type: string
  }
  destinations: [
    {
      channelId?: string
      guildId?: string
      userId?: string
      notificationId: number
    }
  ]
}

interface NotificationResult {
	id: number
	success: boolean
}

function embedColorData(platform: string) {
  switch (platform) {
    case 'CurseForge':
      return '#f87a1b'
    case 'FTB':
      return '#d3cb28'
    case 'GitHub':
      return '#ffffff'
    case 'Mod.io':
      return '#07c1d8'
    case 'Modrinth':
      return '#1bd96a'
    case 'NexusMods':
      return '#d98f40'
    default:
      return '#5865f2'
  }
}

function embedAuthorData(platform: string) {
  switch (platform) {
    case 'CurseForge':
      return {
        name: 'From curseforge.com',
        iconURL: 'https://i.imgur.com/uA9lFcz.png',
        url: 'https://curseforge.com',
      }
    case 'FTB':
      return {
        name: 'From feed-the-beast.com',
        iconUrl: 'https://www.feed-the-beast.com/_next/static/media/logo.2265aa43.svg',
        url: 'https://www.feed-the-beast.com',
      }
    case 'GitHub':
      return {
        name: 'From github.com',
        iconUrl: 'https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png',
        url: 'https://github.com',
      }
    case 'Mod.io':
      return {
        name: 'From mod.io',
        iconUrl: 'https://mod.io/images/branding/modio-cog-blue.png',
        url: 'https://mod.io',
      }
    case 'Modrinth':
      return {
        name: 'From modrinth.com',
        iconURL: 'https://i.imgur.com/2XDguyk.png',
        url: 'https://modrinth.com',
      }
    case 'NexusMods':
      return {
        name: 'From nexusmods.com',
        iconUrl: 'https://www.nexusmods.com/bootstrap/images/vortex/nmm-logomark.svg',
        url: 'https://www.nexusmods.com',
      }
    default:
      return {
        name: 'From unknown source',
      }
  }
}

function trimChangelog(changelog: string, maxLength: number) {
  return changelog.length > maxLength ? `${changelog.slice(0, maxLength - 3)}...` : changelog
}