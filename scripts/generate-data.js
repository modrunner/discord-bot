const { sequelize, Channels, Guilds, GuildChannels, Projects, TrackedProjects } = require('../database/models');

(async () => {
  await sequelize.sync({ force: true });

  await Guilds.bulkCreate([{ id: 100 }, { id: 200 }, { id: 300 }]);

  await GuildChannels.bulkCreate([
    { guildId: 100, channelId: 1000 },
    { guildId: 100, channelId: 2000 },
    { guildId: 200, channelId: 3000 },
    { guildId: 300, channelId: 4000 },
  ]);

  await Projects.bulkCreate([
    { id: 1, platform: 'curseforge', dateUpdated: new Date() },
    { id: 2, platform: 'curseforge', dateUpdated: new Date() },
    { id: 3, platform: 'modrinth', dateUpdated: new Date() },
    { id: 4, platform: 'modrinth', dateUpdated: new Date() },
  ]);

  const guild = await Guilds.findByPk(100);
  await guild.setChangelogMaxLength(1111);
  await guild.setNotificationStyle('yeeeeeet');

  const project = await Projects.findByPk(1);
  await project.addFiles(['1']);
  await project.addFiles(['2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12']);

  await project.track({
    channelId: 4000,
    guildId: 300,
  });

  await project.untrack({
    channelId: 4000,
    guildId: 300,
  });
})();
