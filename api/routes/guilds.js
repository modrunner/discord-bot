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
  if (!guild)
    return response.status(200).json({
      id: request.params.id,
      isBotPresent: false,
    });

  const responseData = {
    id: guild.id,
    isBotPresent: true,
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

// Get a guild's channels
router.route('/:id/channels').get(async (request, response) => {
  const guild = request.app.locals.client.guilds.cache.get(request.params.id);
  if (!guild) return response.status(404).json();

  const guildChannels = guild.channels.cache;

  // Remove any channel that is not a text or forum channel channels
  guildChannels.sweep((channel) => {
    return channel.type !== 0 && channel.type !== 15;
  });

  // Convert Collection to Array to only needed properties
  const guildChannelsArray = guildChannels.map((channel) => {
    return {
      id: channel.id,
      name: channel.name,
      type: getChannelTypeEnum(channel.type),
      position: channel.rawPosition,
    };
  });

  return response.status(200).json(guildChannelsArray);
});

module.exports = router;

function getChannelTypeEnum(type) {
  if (type === 0) {
    return 'text';
  } else if (type === 15) {
    return 'forum';
  } else {
    return 'unknown';
  }
}
