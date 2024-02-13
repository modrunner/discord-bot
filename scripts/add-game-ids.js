const { Projects } = require('../database/db');
const { setTimeout } = require('node:timers/promises');

(async () => {
  const projects = await Projects.findAll({
    where: { platform: 'CurseForge' },
  });

  for (const project of projects) {
    await setTimeout(2000);

    const mod = await fetch(`https://api.curseforge.com/v1/mods/${project.id}`, {
      headers: {
        'x-api-key': process.env.CURSEFORGE_API_KEY,
      },
    }).then(async (res) => await res.json());

    await Projects.update(
      {
        gameId: mod.data.gameId,
      },
      {
        where: {
          id: project.id,
        },
      }
    );

    console.log(`Updated project ${project.name}`);
  }
})();
