const { TrackedProjects, GuildSettings } = require("../../dbObjects");
const { Guilds, Projects } = require("../database/db.ts");
const logger = require("../logger");
const wait = require("node:timers/promises").setTimeout;

(async () => {
  const oldProjects = await TrackedProjects.findAll();
  const oldGuilds = await GuildSettings.findAll();

  logger.info(`Starting migration of ${oldProjects.length} projects...`);

  const failedFetches = [];
  for (const oldProject of oldProjects) {
    logger.info(`Migrating ${oldProject.title}`);

    // Populate projects table
    const newProj = await Projects.fetch(oldProject.id);
    if (!newProj) {
      logger.info(`Fetching info for ${oldProject.title} failed...:(`);
      failedFetches.push(oldProject);
      await wait(500);
      continue;
    }

    logger.info("Migrated information to projects table.");
    logger.info("Adding entries to tracked projects table...");

    // Add tracking data
    const trackingData = oldProject.guild_data;
    for (const guild of trackingData.guilds) {
      for (const channel of guild.channels) {
        await newProj.track(guild.id, channel);
        logger.info(
          `Tracked in guild with id ${guild.id} in channel with id ${channel}`
        );
      }
    }
    logger.info("All project tracking information migrated.");

    await wait(500);
  }

  logger.info(`Project migration complete.`);

  await wait(1000);

  logger.info(`Starting migration of ${oldGuilds.length} guilds...`);

  for (const guild of oldGuilds) {
    await Guilds.create({
      id: guild.guild_id,
      notificationStyle: guild.is_lightweight_mode_enabled
        ? "compact"
        : "normal",
    });
  }

  logger.info("Guild migration complete.");

  logger.info(
    `Database migration completed. Failed to migrate ${failedFetches.length} projects:\n${failedFetches}`
  );
})();
