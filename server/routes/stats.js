const express = require('express');
const router = express.Router();
const { Projects } = require('../../database/db');
const logger = require('../../logger');

router.get('/', async (request, response) => {
  const projectCount = await Projects.count();

  if (process.env.BETTERSTACK_STATUS_PAGE_ID && process.env.BETTERSTACK_RESOURCE_ID) {
    const uptimeData = await fetch(
      `https://uptime.betterstack.com/api/v2/status-pages/${process.env.BETTERSTACK_STATUS_PAGE_ID}/resources/${process.env.BETTERSTACK_RESOURCE_ID}`,
      {
        headers: {
          authorization: `Bearer ${process.env.BETTERSTACK_API_KEY}`,
        },
      }
    )
      .then((res) => res.json())
      .catch((error) => logger.error(error));

    return response.status(200).json({
      servers: request.app.locals.client.guilds.cache.size,
      projects: projectCount,
      uptime: uptimeData.data.attributes.availability,
    });
  } else {
    return response.status(200).json({
      servers: request.app.locals.client.guilds.cache.size,
      projects: projectCount,
      uptime: 0.0,
    });
  }
});

module.exports = router;
