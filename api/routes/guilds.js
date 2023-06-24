const express = require('express');
const router = express.Router();
const { Guilds, TrackedProjects, Projects } = require('../../database/db');
const { Op } = require('sequelize');

router.route('/').get(async (request, response) => {
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
  response.status(200).json(guildsWithProjectData);
});

// Gets a guild's info and tracked projects organized by channel
router.route('/:id').get(async (request, response) => {
  // Get guild settings
  const guild = await Guilds.findByPk(request.params.id);
  if (!guild) return response.status(404);

  const responseData = {
    id: guild.id,
    changelogLength: guild.changelogLength,
    maxProjects: guild.maxProjects,
    notificationStyle: guild.notificationStyle,
    channels: [],
  };

  // Get guild's tracked projects
  const trackedProjects = await TrackedProjects.findAll({
    where: {
      guildId: guild.id,
    },
  });
  if (!trackedProjects.length) return response.status(200).json(responseData);

  // Add channels and channel tracked projects to response data
  const tempChannels = [];
  for (const project of trackedProjects) {
    if (tempChannels.includes(project.channelId)) continue;

    tempChannels.push(project.channelId);

    const channelProjectIds = [];
    for (const prj of trackedProjects) {
      if (prj.channelId === project.channelId) {
        channelProjectIds.push(prj.projectId);
      }
    }

    const projectDetails = await Projects.findAll({
      where: {
        id: {
          [Op.in]: channelProjectIds,
        },
      },
      attributes: {
        exclude: ['fileIds'],
      },
    });

    responseData.channels.push({
      id: project.channelId,
      name: request.app.locals.client.channels.cache.get(project.channelId).name,
      projects: projectDetails,
    });
  }

  return response.status(200).json(responseData);
});

router.route('/:id/projects').get(async (req, res) => {
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

module.exports = router;
