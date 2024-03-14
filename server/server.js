import fs from 'fs'
import express from 'express'
import http from 'http'
import https from 'https'
import logger from '../logger'
import dayjs from 'dayjs'
import { EmbedBuilder, PermissionsBitField, codeBlock } from 'discord.js'
import { Guild } from '../database/db'

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

app.post('/notify', async (request, response) => {
  const client = app.locals.client
  const channel = app.locals.client.channels.cache.get(request.body.channelId)
  const guild = app.locals.client.guilds.cache.get(request.body.guildId)

  if (!channel.viewable || !channel.permissionsFor(client.user.id).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
    logger.warn(`Could not post notification in channel ${channel.name} (${channel.id}) in guild ${guild.name} (${guild.id}) due to insufficient permissions.`)
  }

  const guildSettings = await Guild.findByPk(guild.id)

  const embed = new EmbedBuilder()
    .setAuthor(embedAuthorData(request.body.project.platform))
    .setColor(embedColorData(request.body.project.platform))
    .setDescription(`**Changelog**: ${codeBlock(trimChangelog(request.body.version.changelog, guildSettings.changelogLength))}`)
    .setFields(
      {
        name: 'Version Name',
        value: request.body.version.name,
      },
      {
        name: 'Version Number',
        value: `${request.body.version.number}`,
      },
      {
        name: 'Release Type',
        value: `${request.body.version.type}`,
      },
      {
        name: 'Date Published',
        value: `<t:${dayjs(request.body.version.date).unix()}:f>`,
      }
    )
    .setThumbnail(request.body.project.logo)
    .setTimestamp()
    .setTitle(`${request.body.project.name} has been updated`)
})

export function startServer(client) {
  app.locals.client = client

  let server
  if (process.env.DOPPLER_ENVIRONMENT === 'dev') {
    server = http.createServer(app)
  } else {
    server = https.createServer(
      {
        key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
        cert: fs.readFileSync(process.env.HTTPS_CERT_PATH),
      },
      app
    )
  }

  server.listen(process.env.SERVER_PORT, () => logger.info(`Web server is listening on port ${process.env.SERVER_PORT}`))
}

function embedColorData(platform) {
  switch (platform) {
    case 'CurseForge':
      return '#f87a1b'
    case 'Modrinth':
      return '#1bd96a'
    default:
      return 'DarkGreen'
  }
}

function embedAuthorData(platform) {
  switch (platform) {
    case 'CurseForge':
      return {
        name: 'From curseforge.com',
        iconURL: 'https://i.imgur.com/uA9lFcz.png',
        url: 'https://curseforge.com',
      }
    case 'Modrinth':
      return {
        name: 'From modrinth.com',
        iconURL: 'https://i.imgur.com/2XDguyk.png',
        url: 'https://modrinth.com',
      }
    default:
      return {
        name: 'From unknown source',
      }
  }
}

function trimChangelog(changelog, maxLength) {
  return changelog.length > maxLength ? `${changelog.slice(0, maxLength - 3)}...` : changelog
}
