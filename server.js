const express = require('express');
const port = 3000;
const { Projects } = require('./database/models');

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

server.route('/hello').get((req, res) => {
  res.json({ hello: 'world' });
});

module.exports = { server, port };
