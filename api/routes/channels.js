const express = require('express');
const router = express.Router();

router.route('/:id').get(async (request, response) => {
  const channel = request.app.locals.client.channels.cache.get(request.params.id);
  if (channel) response.status(200).json(channel);
  response.status(404);
});

module.exports = router;
