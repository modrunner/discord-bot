const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const logger = require('../logger');
const { version } = require('../package.json');
const channelsRoute = require('./routes/channels');
const guildsRoute = require('./routes/guilds');
const projectsRoute = require('./routes/projects');

const app = express();

app.use(express.json());

app.use((request, response, next) => {
  const xApiKey = request.get('x-api-key');
  if (!xApiKey || xApiKey !== process.env.X_API_KEY) {
    logger.warn(`Rejected an incoming request from ${request.hostname} (${request.ip}), due to missing or invalid API key.`);
    return response.status(401).end();
  }

  logger.info(`Recieved a request from ${request.hostname} (${request.ip}), at route ${request.method} ${request.originalUrl}`);

  next();
});

app.use('/channels', channelsRoute);
app.use('/guilds', guildsRoute);
app.use('/projects', projectsRoute);

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
  if (process.env.DOPPLER_ENVIRONMENT === 'prd') {
    server = https.createServer({ key: fs.readFileSync('./key.pem'), cert: fs.readFileSync('./cert.pem') }, app);
  } else {
    server = http.createServer(app);
  }

  server.listen(process.env.SERVER_PORT, () => logger.info(`Web server is listening on port ${process.env.SERVER_PORT}`));
}

module.exports = { startServer };
