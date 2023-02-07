const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const logger = require('./logger');
const { Guilds, Projects, TrackedProjects } = require('./database/models');
const { version } = require('./package.json');

const app = express();

app.use(express.json());

app.use((req, res, next) => {
  logger.info(`Recieved a request from ${req.ip}`);
  res.append('Access-Control-Allow-Origin', process.env.CORS_ORIGIN);
  next();
});

app.get('/', (req, res) => {
  res.status(200).json({
    about: 'Welcome Traveller!',
    name: 'modrunner-api',
    version: version,
  });
});

app.route('/channel/:id').get(async (req, res) => {
  const channel = app.locals.client.channels.cache.get(req.params.id);
  if (channel) res.status(200).json(channel);
  res.status(404);
});

app.route('/guilds').get(async (req, res) => {
  let guildsWithProjectData = [];
  const guilds = await Guilds.findAll();
  for (const guild of guilds) {
    const projects = await TrackedProjects.findAll({
      where: { guildId: guild.id },
    });
    guildsWithProjectData.push({
      id: guild.id,
      changelogMaxLength: guild.changelogMaxLength,
      maxTrackedProjects: guild.maxTrackedProjects,
      notificationStyle: guild.notificationStyle,
      projects: [...projects],
    });
  }
  res.status(200).json(guildsWithProjectData);
});

app.route('/guilds/:id/projects').get(async (req, res) => {
  const projects = await TrackedProjects.findAll({
    where: {
      guildId: req.params.id,
    },
  });
  if (projects) {
    res.status(200).json(projects);
  } else {
    res.status(404);
  }
});

app.get('/project/:id', async (req, res) => {
  const project = await Projects.findByPk(req.params.id);
  if (!project) {
    res.status(404).json({
      error: `No project with ID ${req.params.id} found in database.`,
    });
  } else {
    res.status(200).json(project);
  }
});

app.get('/projects/:ids', async (req, res) => {
  const ids = JSON.parse(req.params.ids);
  logger.info(ids);
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
