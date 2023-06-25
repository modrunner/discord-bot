const express = require('express');
const router = express.Router();
const { Projects } = require('../../database/db');
const logger = require('../../logger');

router.get('/', async (request, response) => {
  const projectCount = await Projects.count();

  const uptimeData = await fetch('https://uptime.betterstack.com/api/v2/status-pages/161181/resources/2650613', {
    headers: {
      authorization: `Bearer ${process.env.BS_API_KEY}`,
    },
  })
    .then((res) => res.json())
    .catch((error) => logger.error(error));

  return response.status(200).json({
    servers: request.app.locals.client.guilds.cache.size,
    projects: projectCount,
    uptime: uptimeData.data.attributes.availability,
  });
});

module.exports = router;
