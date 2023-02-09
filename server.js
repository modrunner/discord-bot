const fs = require('fs');
const express = require('express');
const http = require('http');
const https = require('https');
const logger = require('./logger');
const { Guilds, Projects, TrackedProjects } = require('./database/models');
const { version } = require('./package.json');
const { getMods } = require('./api/curseforge');
const { getProjects } = require('./api/modrinth');

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

app.route('/guilds/:id').get(async (req, res) => {
  // Get guild settings
  const guild = await Guilds.findByPk(req.params.id);
  if (!guild) {
    res.status(404).json({
      error: 'Modrunner is not present in this guild',
    });
  }

  const guildResponseData = {
    id: guild.id,
    changelogMaxLength: guild.changelogMaxLength,
    maxTrackedProjects: guild.maxTrackedProjects,
    notificationStyle: guild.notificationStyle,
    trackedProjects: [],
  };

  // Get guild's tracked projects
  const trackedProjects = await TrackedProjects.findAll({ where: { guildId: guild.id } });
  if (!trackedProjects.length) return res.status(200).json(guildResponseData);

  // Filter duplicate project IDs
  const uniqueProjects = [];
  for (const project of trackedProjects) {
    const existingProject = uniqueProjects.find((prj) => prj.projectId === project.projectId);
    if (existingProject === undefined) {
      uniqueProjects.push(project);
    }
  }

  let curseforgeProjects = [];
  let modrinthProjects = [];
  for (const project of uniqueProjects) {
    if (project.projectId.match(/[A-z]/)) {
      modrinthProjects.push(project);
    } else {
      curseforgeProjects.push(project);
    }
  }

  // Fetch curseforge project data
  if (curseforgeProjects.length) {
    const curseforgeIds = curseforgeProjects.map((project) => project.projectId);
    const curseforgeResponse = await getMods(curseforgeIds);
    if (curseforgeResponse.statusCode !== 200) {
      return res.status(500).json({
        error: 'Failed to retrieve project information from CurseForge',
      });
    }

    const curseforgeProjectData = await curseforgeResponse.body.json();
    for (const project of curseforgeProjectData.data) {
      const projectChannels = await TrackedProjects.findAll({
        where: {
          projectId: project.id,
          guildId: guild.id,
        },
      });

      let channelIds = [];
      for (const channel of projectChannels) {
        const apiChannel = app.locals.client.channels.cache.get(channel.channelId);
        channelIds.push({
          id: channel.channelId,
          name: apiChannel.name,
        });
      }

      guildResponseData.trackedProjects.push({
        id: project.id,
        name: project.name,
        icon: project.logo.url,
        channels: channelIds,
      });
    }
  }

  // Fetch modrinth project data
  if (modrinthProjects.length) {
    const modrinthIds = modrinthProjects.map((project) => project.projectId);
    const modrinthResponse = await getProjects(modrinthIds);
    if (modrinthResponse.statusCode !== 200) {
      return res.status(500).json({
        error: 'Failed to retrieve project information from Modrinth',
      });
    }

    const modrinthProjectData = await modrinthResponse.body.json();
    for (const project of modrinthProjectData) {
      const projectChannels = await TrackedProjects.findAll({
        where: {
          projectId: project.id,
          guildId: guild.id,
        },
      });

      let channelIds = [];
      for (const channel of projectChannels) {
        const apiChannel = app.locals.client.channels.cache.get(channel.channelId);
        channelIds.push({
          id: channel.channelId,
          name: apiChannel.name,
        });
      }

      guildResponseData.trackedProjects.push({
        id: project.id,
        name: project.title,
        icon: project.icon_url,
        channels: channelIds,
      });
    }
  }

  guildResponseData.trackedProjects.sort((a, b) => a.name.localeCompare(b.name));
  res.status(200).json(guildResponseData);
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
