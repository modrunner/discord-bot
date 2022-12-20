const logger = require('./../logger');
const { getMods, getProjects, listProjectVersions, getModFileChangelog } = require('../api/apiMethods');
const ms = require('ms');
const dayjs = require('dayjs');
const getJSONResponse = require('../api/getJSONResponse');
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, ActivityType } = require('discord.js');
const { ApiCallManager } = require('../api/apiCallManager');
const { Guilds, Projects, TrackedProjects } = require('../database/models');

module.exports = {
  name: 'ready',
  async execute(client) {
    logger.info('Ready status reported.');

    await sweepDatabase(client);
    await checkForProjectUpdates(client);
    await updatePresenceData(client);

    setInterval(runSweepDatabase, ms('24h'));
    setInterval(runUpdateCheck, ms('1m'));
    setInterval(runUpdatePresence, ms('10m'));
    setInterval(runLogCalls, ms('24h'));

    async function runSweepDatabase() {
      await sweepDatabase(client);
    }

    async function runUpdateCheck() {
      await checkForProjectUpdates(client);
    }

    function runUpdatePresence() {
      updatePresenceData(client);
    }

    function runLogCalls() {
      ApiCallManager.logCalls();
    }
  },
};

/**
 * The primary function that handles the functionality for checking for updates to projects
 */
async function checkForProjectUpdates(client) {
  logger.debug('Running global update check...');

  // Get all projects from the database. We seperate them by platform so we can call the appropriate API and read the returned data correctly
  const dbCurseforgeProjects = await Projects.findAll({
    where: { platform: 'curseforge' },
  });
  const dbModrinthProjects = await Projects.findAll({
    where: { platform: 'modrinth' },
  });

  const dbCurseforgeProjectsIds = [];
  for (const dbProject of dbCurseforgeProjects) {
    dbCurseforgeProjectsIds.push(dbProject.id);
  }

  const dbModrinthProjectIds = [];
  for (const dbProject of dbModrinthProjects) {
    dbModrinthProjectIds.push(dbProject.id);
  }

  // Call the CurseForge API
  let requestedMods, requestedProjects;
  if (dbCurseforgeProjectsIds.length) {
    var curseforgeResponseData = await getMods(dbCurseforgeProjectsIds);
    if (curseforgeResponseData) {
      if (curseforgeResponseData.statusCode === 200) {
        requestedMods = await getJSONResponse(curseforgeResponseData.body);
      } else {
        logger.warn(`Unexpected ${curseforgeResponseData.statusCode} status code while checking CurseForge projects for updates.`);
      }
    } else {
      logger.warn('A request to CurseForge timed out while checking projects for updates.');
    }
  } else {
    logger.info('No CurseForge projects in database. Skipping.');
  }

  // Call the Modrinth API
  if (dbModrinthProjectIds.length) {
    var modrinthResponseData = await getProjects(dbModrinthProjectIds);
    if (modrinthResponseData) {
      if (modrinthResponseData.statusCode === 200) {
        requestedProjects = await getJSONResponse(modrinthResponseData.body);
      } else {
        logger.warn(`Unexpected ${modrinthResponseData.statusCode} status code while checking Modrinth projects for updates.`);
      }
    } else {
      logger.warn('A request to Modrinth timed out while checking projects for updates.');
    }
  } else {
    logger.info('No Modrinth projects in database. Skipping.');
  }

  // Process information returned from the CurseForge API and perform checks
  if (dbCurseforgeProjects.length) {
    for (const dbProject of dbCurseforgeProjects) {
      // If the initial API call failed
      if (!requestedMods) break;
      const requestedMod = requestedMods.data.find((element) => element.id.toString() === dbProject.id);
      if (!requestedMod) {
        logger.warn(`Modrunner failed to locate a database project ${dbProject.name}'s (${dbProject.id}) information in the response data.`);
        continue;
      }
      // Check if this project has been updated
      if (dbProject.dateUpdated.getTime() !== new Date(requestedMod.dateReleased).getTime()) {
        // Verify the file has been approved
        /*
        if (requestedMod.latestFilesIndexes[0].fileStatus !== 4) {
          logger.debug(`${dbProject.name}'s latest file has not been approved.`);
          continue;
        }
				*/
        // Verify that this latest file's ID is not in the database. If it is, it has already been reported as updated
        if (dbProject.fileIds.includes(requestedMod.latestFilesIndexes[0].fileId)) {
          logger.debug(`${dbProject.name}'s latest file has already been reported on.`);
          await dbProject.updateDate(requestedMod.dateReleased);
          continue;
        }

        // If we get here, the project has passed all verification checks and has a legitmate update available
        logger.info(
          `Update detected for CurseForge project ${dbProject.name} (${dbProject.id})\nFilename: ${requestedMod.latestFilesIndexes[0].fileName}\nFile Id: ${requestedMod.latestFilesIndexes[0].fileId}`
        );

        await dbProject.updateDate(requestedMod.dateReleased);
        await dbProject.addFiles([requestedMod.latestFilesIndexes[0].fileId]);

        await sendUpdateEmbed(requestedMod, dbProject, client);
      } else {
        logger.debug(`No update detected for ${dbProject.name}.`);
      }
    }
  }
  logger.debug('CurseForge update check complete.');

  // Process information returned from the Modrinth API and perform checks
  if (dbModrinthProjects.length) {
    for (const dbProject of dbModrinthProjects) {
      // If the initial API call failed
      if (!requestedProjects) break;
      const requestedProject = requestedProjects.find((project) => project.id === dbProject.id);
      // Check if the project has been updated
      if (dbProject.dateUpdated.getTime() !== new Date(requestedProject.updated).getTime()) {
        // Verify that this file's ID is not in the database. If it is, it has already been reported as updated
        let reported = false;
        for (const fileId of requestedProject.versions) {
          if (dbProject.fileIds.includes(fileId)) {
            await dbProject.updateDate(requestedProject.updated);
            break;
          }
        }
        if (reported) continue;

        // If we get here, the project has passed all verification checks and has a legitmate update available
        logger.info(`Update detected for Modrinth project ${dbProject.name} (${dbProject.id})`);

        await dbProject.updateDate(requestedProject.updated);
        await dbProject.addFiles(requestedProject.versions);

        await sendUpdateEmbed(requestedProject, dbProject, client);
      } else {
        logger.debug(`No update detected for ${dbProject.name}.`);
      }
    }
  }
  logger.debug('Modrinth update check complete.');
}

/**
 * Handles sending update notifications to the appropriate guild channels where a project is tracked
 * @param {*} requestedProject - The project's API data
 * @param {*} dbProject - The project's database data
 */
async function sendUpdateEmbed(requestedProject, dbProject, client) {
  let versionData;

  // Behavior is slightly different depending on platform, mostly dependent on the data returned from the initial earlier API call
  switch (dbProject.platform) {
    case 'curseforge': {
      // Call the CurseForge API to get this file's changelog
      const response = await getModFileChangelog(requestedProject.id, requestedProject.latestFiles[requestedProject.latestFiles.length - 1].id);
      if (!response) return logger.warn("A request to CurseForge timed out while getting a project file's changelog");
      if (response.statusCode !== 200) return logger.warn(`Unexpected ${response.statusCode} status code while getting a project files's changelog.`);

      const rawData = await getJSONResponse(response.body);
      versionData = {
        changelog: rawData.data,
        date: requestedProject.latestFiles[requestedProject.latestFiles.length - 1].fileDate,
        name: requestedProject.latestFiles[requestedProject.latestFiles.length - 1].displayName,
        number: requestedProject.latestFiles[requestedProject.latestFiles.length - 1].fileName,
        type: releaseTypeToString(requestedProject.latestFiles[requestedProject.latestFiles.length - 1].releaseType),
        url: `https://www.curseforge.com/minecraft/${classIdToUrlString(requestedProject.classId)}/${requestedProject.slug}/files/${
          requestedProject.latestFilesIndexes[0].fileId
        }`,
      };

      break;
    }
    case 'modrinth': {
      // Call the Modrinth API to get this version's information
      const response = await listProjectVersions(requestedProject.id);
      if (!response) return logger.warn("A request to Modrinth timed out while getting a project's version information");
      if (response.statusCode !== 200) return logger.warn(`Unexpected ${response.statusCode} status code while getting a project's version information.`);

      const rawData = await getJSONResponse(response.body);
      versionData = {
        changelog: rawData[0].changelog,
        date: rawData[0].date_published,
        name: rawData[0].name,
        number: rawData[0].version_number,
        type: capitalize(rawData[0].version_type),
        url: `https://modrinth.com/${requestedProject.project_type}/${requestedProject.slug}/version/${rawData[0].version_number}`,
      };

      break;
    }
    default:
      return logger.warn('Update notification functionality has not been implemented for this platform yet.');
  }

  // Send the notification to each appropriate guild channel
  const trackedProjects = await TrackedProjects.findAll({
    where: {
      projectId: dbProject.id,
    },
  });

  for (const trackedProject of trackedProjects) {
    const guild = client.guilds.cache.get(trackedProject.guildId);
    if (!guild) {
      logger.warn(`Could not find guild with ID ${trackedProject.guildId} in cache. Update notification not sent.`);
      continue;
    }
    const channel = guild.channels.cache.get(trackedProject.channelId);
    if (!channel) {
      logger.warn(`Could not find channel with ID ${trackedProject.channelId} in cache. Update notification not sent.`);
      continue;
    }
    const guildSettings = await Guilds.findByPk(trackedProject.guildId);
    switch (guildSettings.notificationStyle) {
      case 'compact':
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setColor(embedColorData(dbProject.platform))
              .setDescription(`${versionData.number} (${capitalize(versionData.type)})`)
              .setFooter({
                text: `${dayjs(versionData.date).format('MMM D, YYYY')}`,
                iconURL: embedAuthorData(dbProject.platform).iconURL ?? null,
              })
              .setTitle(`${dbProject.name} ${versionData.name}`)
              .setURL(versionData.url),
          ],
        });
        break;
      default:
        await channel.send({
          embeds: [
            new EmbedBuilder()
              .setAuthor(embedAuthorData(dbProject.platform))
              .setColor(embedColorData(dbProject.platform))
              .setDescription(`**Changelog**: ${codeBlock(trimChangelog(versionData.changelog, guildSettings.changelogMaxLength))}`)
              .setFields(
                {
                  name: 'Version Name',
                  value: versionData.name,
                },
                {
                  name: 'Version Number',
                  value: `${versionData.number}`,
                },
                {
                  name: 'Release Type',
                  value: `${versionData.type}`,
                },
                {
                  name: 'Date Published',
                  value: `<t:${dayjs(versionData.date).unix()}:f>`,
                }
              )
              .setThumbnail()
              .setTimestamp()
              .setTitle(`${dbProject.name} has been updated`),
          ],
          components: [
            new ActionRowBuilder().addComponents(
              new ButtonBuilder()
                .setLabel(`View on ${capitalize(dbProject.platform)}`)
                .setStyle(ButtonStyle.Link)
                .setURL(versionData.url)
            ),
          ],
        });
    }
  }
}

async function updatePresenceData(client) {
  let projects = await Projects.findAndCountAll();
  for (const project of projects.rows) {
    const tracked = await TrackedProjects.findOne({
      where: {
        projectId: project.id,
      },
    });
    if (!tracked) {
      await Projects.destroy({
        where: {
          id: project.id,
        },
      });
      projects.count--;
    }
  }

  client.user.setPresence({
    activities: [
      {
        type: ActivityType.Watching,
        name: `${projects.count} projects for updates in ${client.guilds.cache.size} servers.`,
      },
    ],
    status: 'online',
  });
}

async function sweepDatabase(client) {
  const tracked = await TrackedProjects.findAll();
  let trackedSwept = 0;
  for (const project of tracked) {
    if (!client.channels.cache.has(project.channelId)) {
      const deleted = await TrackedProjects.destroy({
        where: {
          guildId: project.guildId,
          channelId: project.channelId,
        },
      });
      trackedSwept += deleted;
    }
  }
  logger.info(`Swept ${trackedSwept} tracked projects with missing channels from the database.`);

  const projects = await Projects.findAll();
  let projectsSwept = 0;
  for (const project of projects) {
    const found = await TrackedProjects.findOne({
      where: {
        projectId: project.id,
      },
    });
    if (!found) {
      await Projects.destroy({
        where: {
          id: project.id,
        },
      });
      projectsSwept++;
    }
  }
  logger.info(`Swept ${projectsSwept} projects not being tracked in any guild from the database.`);
}

function classIdToUrlString(classId) {
  switch (classId) {
    case 5:
      return 'bukkit-plugins';
    case 6:
      return 'mc-mods';
    case 12:
      return 'texture-packs';
    case 17:
      return 'worlds';
    case 4471:
      return 'modpacks';
    case 4546:
      return 'customization';
    case 4559:
      return 'mc-addons';
    default:
      return 'unknownClassIdValue';
  }
}

function releaseTypeToString(releaseType) {
  switch (releaseType) {
    case 1:
      return 'release';
    case 2:
      return 'beta';
    case 3:
      return 'alpha';
    default:
      return 'unknownReleaseType';
  }
}

function capitalize(string) {
  return string.replace(string.charAt(0), String.fromCharCode(string.charCodeAt(0) - 32));
}

function embedAuthorData(platform) {
  switch (platform) {
    case 'curseforge':
      return {
        name: 'From curseforge.com',
        iconURL: 'https://i.imgur.com/uA9lFcz.png',
        url: 'https://curseforge.com',
      };
    case 'modrinth':
      return {
        name: 'From modrinth.com',
        iconURL: 'https://i.imgur.com/2XDguyk.png',
        url: 'https://modrinth.com',
      };
    default:
      return {
        name: 'From unknown source',
      };
  }
}

function embedColorData(platform) {
  switch (platform) {
    case 'curseforge':
      return '#f87a1b';
    case 'modrinth':
      return '#1bd96a';
    default:
      return 'DarkGreen';
  }
}

function trimChangelog(changelog, maxLength) {
  const formattedChangelog = formatHtmlChangelog(changelog);
  return formattedChangelog.length > maxLength ? `${formattedChangelog.slice(0, maxLength - 3)}...` : formattedChangelog;
}

function formatHtmlChangelog(changelog) {
  return changelog
    .replace(/<br>/g, '\n') // Fix line breaks
    .replace(/<.*?>/g, '') // Remove HTML tags
    .replace(/&\w*?;/g, ''); // Remove HTMl special characters
}
