const express = require('express');
const router = express.Router();
const { Guilds, Projects, TrackedProjects } = require('../../database/db');
const logger = require('../../logger');
const checkPermissionsMiddleware = require('../middleware/checkUserPermissions');

router.get('/:id', async (request, response) => {
  const project = await Projects.findByPk(request.params.id);
  if (!project) {
    response.status(404).json({
      error: `No project with ID ${request.params.id} found in database.`,
    });
  } else {
    response.status(200).json(project);
  }
});

router.post('/track', checkPermissionsMiddleware, async (request, response) => {
  if (!request.body.projectId || !request.body.guildId || !request.body.channelId || !request.body.roleIds) {
    return response.status(400).json({
      error: `Missing required body parameters: ${!request.body.projectId ? 'projectId' : ''} ${!request.body.guildId ? 'guildId' : ''} ${
        !request.body.channelId ? 'channelId' : ''
      } ${!request.body.roleIds ? 'roleIds' : ''}`,
    });
  }

  const project = await Projects.fetch(request.body.projectId);
  if (!project) return response.status(404).json({ error: `No project exists with ID ${request.body.projectId}` });

  const guildSettings = await Guilds.findByPk(request.body.guildId, { attributes: ['maxProjects'] });
  const currentlyTrackedNumber = await TrackedProjects.count({
    where: {
      guildId: request.body.guildId,
    },
  });
  if (currentlyTrackedNumber >= guildSettings.maxProjects)
    return response.status(403).json({ error: 'This guild has reached its maximum number of allowed tracked projects.' });

  // eslint-disable-next-line no-unused-vars
  const [trackedProject, created] = await project.track(request.body.guildId, request.body.channelId);

  if (request.body.roleIds.length) {
    // Add the role to the tracked project
    await trackedProject.addRolesUsingIds(request.body.roleIds);
  }

  if (created) return response.status(201).end();
  return response.status(204).end();
});

router.delete('/untrack', checkPermissionsMiddleware, async (request, response) => {
  let deleted = 0;
  try {
    deleted = await TrackedProjects.destroy({
      where: {
        projectId: request.body.projectId,
        channelId: request.body.channelId,
        guildId: request.body.guildId,
      },
    });
  } catch (error) {
    logger.error(error);
  }

  if (deleted > 0) {
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

router.patch('/edit', checkPermissionsMiddleware, async (request, response) => {
  let updated = [];
  try {
    updated = await TrackedProjects.update(
      {
        channelId: request.body.newProject.channelId,
        roleIds: request.body.newProject.roleIds,
      },
      {
        where: {
          projectId: request.body.oldProject.projectId,
          channelId: request.body.oldProject.channelId,
          guildId: request.body.oldProject.guildId,
        },
      }
    );
  } catch (error) {
    logger.error(error);
  }

  if (updated[0] > 0) {
    response.status(204).end();
  } else {
    response.status(404).end();
  }
});

module.exports = router;
