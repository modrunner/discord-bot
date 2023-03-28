const express = require('express');
const router = express.Router();
const { Guilds, TrackedProjects } = require('../../database/db');
const { getMods } = require('../curseforge');
const { getProjects } = require('../modrinth');

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

router.route('/:id').get(async (request, response) => {
  // Get guild settings
  const guild = await Guilds.findByPk(request.params.id);
  if (!guild) {
    return request.status(404).json({
      error: 'Modrunner is not present in this guild',
    });
  }

  const guildResponseData = {
    id: guild.id,
    changelogLength: guild.changelogLength,
    maxProjects: guild.maxProjects,
    notificationStyle: guild.notificationStyle,
    trackedProjects: [],
  };

  // Get guild's tracked projects
  const trackedProjects = await TrackedProjects.findAll({ where: { guildId: guild.id } });
  if (!trackedProjects.length) return response.status(200).json(guildResponseData);

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
      return response.status(500).json({
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
        const apiChannel = request.app.locals.client.channels.cache.get(channel.channelId);
        channelIds.push({
          id: channel.channelId,
          name: apiChannel.name,
        });
      }

      guildResponseData.trackedProjects.push({
        id: project.id,
        platform: 'curseforge',
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
      return response.status(500).json({
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
        const apiChannel = request.app.locals.client.channels.cache.get(channel.channelId);
        channelIds.push({
          id: channel.channelId,
          name: apiChannel.name,
        });
      }

      guildResponseData.trackedProjects.push({
        id: project.id,
        platform: 'modrinth',
        name: project.title,
        icon: project.icon_url,
        channels: channelIds,
      });
    }
  }

  guildResponseData.trackedProjects.sort((a, b) => a.name.localeCompare(b.name));
  response.status(200).json(guildResponseData);
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
