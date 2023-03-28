const { oldGuilds, oldProjects, oldTrackedProjects } = require('../database/databases_old/db_old.js');
const { Guilds, Projects, TrackedProjects } = require('../database/db.js');
const logger = require('../logger.js');

(async () => {
  logger.info('Starting database migration...');

  // Migrate guilds
  logger.info('Migrating guilds table...');

  const old_guilds = await oldGuilds.findAll();
  for (const old_guild of old_guilds) {
    await Guilds.create({
      id: old_guild.id,
      changelogLength: old_guild.changelogMaxLength,
      maxProjects: old_guild.maxTrackedProjects,
      notificationStyle: old_guild.notificationStyle,
    }).catch((error) => logger.error(error));
  }

  logger.info(`Migrated ${old_guilds.length} entries into new guild table.`);

  // Migrate projects
  logger.info(`Migrating projects table...`);

  const old_projects = await oldProjects.findAll();
  for (const old_project of old_projects) {
    const old_project_platform = old_project.id.match(/[A-z]/) ? 'modrinth' : 'curseforge';
    await Projects.create({
      id: old_project.id,
      platform: old_project_platform,
      name: old_project.name,
      dateUpdated: old_project.dateUpdated,
      fileIds: old_project.fileIds,
    }).catch((error) => logger.error(error));
  }

  logger.info(`Migrated ${old_projects.length} entries into new projects table.`);

  // Migrate tracked projects
  logger.info(`Migrating tracked projects table...`);

  const old_tracked_projects = await oldTrackedProjects.findAll();
  for (const old_tracked_project of old_tracked_projects) {
    const old_tracked_project_platform = old_tracked_project.projectId.match(/[A-z]/) ? 'modrinth' : 'curseforge';
    await TrackedProjects.create({
      projectId: old_tracked_project.projectId,
      projectPlatform: old_tracked_project_platform,
      channelId: old_tracked_project.channelId,
      guildId: old_tracked_project.guildId,
      roleIds: old_tracked_project.roleIds,
    }).catch((error) => logger.error(error));
  }

  logger.info(`Migrated ${old_tracked_projects.length} entries into new tracked projects table.`);

  logger.info('Database migration complete.');
})();
