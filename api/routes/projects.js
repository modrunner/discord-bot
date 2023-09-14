const express = require('express');
const router = express.Router();
const { Projects, TrackedProjects } = require('../../database/db');
const logger = require('../../logger');

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

router.delete('/untrack', async (request, response) => {
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

router.patch('/edit', async (request, response) => {
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
