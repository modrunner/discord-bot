import fs from 'fs'
import express from 'express'
import http from 'http'
import https from 'https'
import { logger } from '../logger.js'
import dayjs from 'dayjs'
import { Client, EmbedBuilder, PermissionsBitField, codeBlock } from 'discord.js'

const app = express()

app.use(express.json())

app.use((request, response, next) => {
  // const xApiKey = request.get('x-api-key');
  // if (!xApiKey || xApiKey !== process.env.MODRUNNER_API_KEY) {
  //   logger.warn(`Rejected an unauthorized request from ${request.hostname} (${request.ip}) at route ${request.method} ${request.originalUrl}`);
  //   return response.status(401).end();
  // }

  logger.debug(`Recieved a request from ${request.hostname} (${request.ip}), at route ${request.method} ${request.originalUrl}`)

  next()
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
      type: 'channel' | 'user'
      channelId?: string
      guildId?: string
      userId?: string
      notificationId: number
    }
  ]
}

app.post('/notify', async (request, response) => {
  if (!request.body) return response.status(400).end()

  const data: NotifyRequest[] = request.body

  for (const notification of data) {
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

    for (const destination of notification.destinations) {
      switch (destination.type) {
        case 'channel':
        case 'user':
        default:
      }
    }
  }

  // if (!request.body.destination) return response.status(400).end()

  // if (request.body.destination === 'channel') {
  //   if (!request.body.channelId && !request.body.guildId) return response.status(400).end()

  //   const channel = app.locals.client.channels.cache.get(request.body.channelId)
  //   const guild = app.locals.client.guilds.cache.get(request.body.guildId)

  //   if (!channel || !guild) return response.status(500).end()

  //   if (
  //     !channel.viewable ||
  //     !channel.permissionsFor(app.locals.client.user.id).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])
  //   ) {
  //     logger.warn(
  //       `Could not post notification in channel ${channel.name} (${channel.id}) in guild ${guild.name} (${guild.id}) due to insufficient permissions.`
  //     )
  //     return response.status(403).end()
  //   }
  // } else if (request.body.destination === 'user') {
  //   if (!request.body.userId) return response.status(400).end()
  // }
})

export function startServer(client: Client) {
  app.locals.client = client

  let server
  if (process.env.HTTPS_KEY_PATH && process.env.HTTPS_CERT_PATH) {
    server = https.createServer(
      {
        key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
        cert: fs.readFileSync(process.env.HTTPS_CERT_PATH),
      },
      app
    )
  } else {
    server = http.createServer(app)
  }

  server.listen(process.env.SERVER_PORT, () => logger.info(`Web server is listening on port ${process.env.SERVER_PORT}`))
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
