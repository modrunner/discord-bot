const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const logger = require('../logger');
const { version } = require('../package.json');
const channelsRoute = require('./routes/channels');
const guildsRoute = require('./routes/guilds');
const projectsRoute = require('./routes/projects');
const statsRoute = require('./routes/stats');

const app = express();

app.use(express.json());

app.use((request, response, next) => {
  const xApiKey = request.get('x-api-key');
  if (!xApiKey || xApiKey !== process.env.MODRUNNER_API_KEY) {
    logger.warn(`Rejected an unauthorized request from ${request.hostname} (${request.ip}) at route ${request.method} ${request.originalUrl}`);
    return response.status(401).end();
  }

  logger.debug(`Recieved a request from ${request.hostname} (${request.ip}), at route ${request.method} ${request.originalUrl}`);

  next();
});

app.use('/channels', channelsRoute);
app.use('/guilds', guildsRoute);
app.use('/projects', projectsRoute);
app.use('/stats', statsRoute);

app.get('/', (request, response) => {
  response.status(200).json({
    about: 'Welcome Traveller!',
    name: 'modrunner-api',
    version: version,
  });
});

function startServer(client) {
  app.locals.client = client;

  let server;
  if (process.env.DOPPLER_ENVIRONMENT === 'dev') {
    server = http.createServer(app);
  } else {
    server = https.createServer(
      {
        key: fs.readFileSync(process.env.HTTPS_KEY_PATH),
        cert: fs.readFileSync(process.env.HTTPS_CERT_PATH),
      },
      app
    );
  }

  server.listen(process.env.SERVER_PORT, () => logger.info(`Web server is listening on port ${process.env.SERVER_PORT}`));
}

module.exports = { startServer };
