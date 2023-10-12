const { Projects, TrackedProjects } = require('../database/db');

(async () => {
  const allProjects = await Projects.findAll();

  for (const project of allProjects) {
    let newPlatform = '';
    if (project.platform === 'curseforge') {
      newPlatform = 'CurseForge';
    } else {
      newPlatform = 'Modrinth';
    }

    await Projects.update(
      {
        platform: newPlatform,
      },
      {
        where: {
          id: project.id,
        },
      }
    );

    await TrackedProjects.update(
      {
        projectPlatform: newPlatform,
      },
      {
        where: {
          projectId: project.id,
        },
      }
    );
  }
})();
