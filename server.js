const express = require('express');
const { Guilds, Projects, TrackedProjects } = require('./database/models');
const logger = require('./logger');

const server = express();

server.get('/', async (req, res) => {
  res.json('Hello world');
});

server.get('/projects/:id', async (req, res) => {
  const project = await Projects.findByPk(req.params.id);
  if (!project) {
    res.status(404).json({
      error: 'Could not find that project id in the database.',
    });
  } else {
    res.status(200).json(project);
  }
});

server.route('/guilds/list').get(async (req, res) => {
  const guilds = await Guilds.findAll();
  res.status(200).json(guilds);
});

server.route('/guilds/:id/projects').get(async (req, res) => {
  logger.info(`Recieved a request for guild ${req.params.id} projects`);
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

module.exports = { server };
