const readline = require('node:readline');
const { Guilds } = require('../database/db');

(async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    rl.question('Enter guild ID: ', async (id) => {
      const guild = await Guilds.findByPk(id);
      rl.question('Enter new max: ', async (max) => {
        await guild.setMaxTrackedProjects(max);
        console.log(`Set guild's max tracked projects to ${max}.`);
        rl.close();
      });
    });
  } catch (error) {
    console.error(error);
  }
})();
