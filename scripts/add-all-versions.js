const { Projects } = require('../database/db.js');
const getJSONResponse = require('../api/getJSONResponse');
const { getProjects } = require('../api/modrinth');

addAllVersions();
async function addAllVersions() {
  const projects = await Projects.findAll({
    where: {
      platform: 'Modrinth',
    },
  });

  await Projects.update(
    {
      fileIds: [],
    },
    {
      where: {
        platform: 'Modrinth',
      },
    }
  );

  const dbModrinthProjectIds = [];
  for (const dbProject of projects) {
    dbModrinthProjectIds.push(dbProject.id);
  }

  let modrinthResponseData = await getProjects(dbModrinthProjectIds);
  let requestedProjects = await getJSONResponse(modrinthResponseData.body);

  for (const requestedProject of requestedProjects) {
    const dbProject = await Projects.findByPk(requestedProject.id);

    dbProject.addFiles(requestedProject.versions);
  }
}
