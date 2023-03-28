const express = require('express');
const router = express.Router();
const { Projects } = require('../../database/db');

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

module.exports = router;
