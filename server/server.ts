import fs from 'fs'
import express from 'express'
import http from 'http'
import https from 'https'
import { logger } from '../logger.js'
import { Client } from 'discord.js'

import { notify } from './routes/notify.js'
import { stats } from './routes/stats.js'

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

app.use(notify)
app.use(stats)

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

  server.listen(process.env.SERVER_PORT, () => logger.info(`Web server is online and listening for incoming requests on port ${process.env.SERVER_PORT}`))
}




