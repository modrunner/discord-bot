const logger = require("./../logger");
const { getMods, getProjects, listProjectVersions, getModFileChangelog } = require("../api/apiMethods");
const ms = require("ms");
const dayjs = require("dayjs");
const getJSONResponse = require("../api/getJSONResponse");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, codeBlock, ActivityType } = require("discord.js");
const { ApiCallManager } = require("../api/apiCallManager");
const { Guilds, Projects, TrackedProjects } = require("../database/models");

module.exports = {
  name: "ready",
  async execute(client) {
    logger.info("Ready status reported.");

    await checkForProjectUpdates(client);
    await updatePresenceData(client);

    setInterval(runUpdateCheck, ms("1m"));
    setInterval(runUpdatePresence, ms("10m"));
    setInterval(runLogCalls, ms("24h"));

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
  logger.debug("Running global update check...");

  // Get all projects from the database. We seperate them by platform so we can call the appropriate API and read the returned data correctly
  const dbCurseforgeProjects = await Projects.findAll({
    where: { platform: "curseforge" },
  });
  const dbModrinthProjects = await Projects.findAll({
    where: { platform: "modrinth" },
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
      logger.warn("A request to CurseForge timed out while checking projects for updates.");
    }
  } else {
    logger.info("No CurseForge projects in database. Skipping.");
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
      logger.warn("A request to Modrinth timed out while checking projects for updates.");
    }
  } else {
    logger.info("No Modrinth projects in database. Skipping.");
  }

  // Process information returned from the CurseForge API and perform checks
  if (dbCurseforgeProjects.length) {
    for (const dbProject of dbCurseforgeProjects) {
      const requestedMod = requestedMods.data.find((element) => element.id.toString() === dbProject.id);
      // Check if this project has been updated
      if (dbProject.dateUpdated.getTime() !== new Date(requestedMod.dateReleased).getTime()) {
        // Verify the file has been approved
        if (requestedMod.latestFiles[requestedMod.latestFiles.length - 1].fileStatus !== 4) continue;
        // Verify that this file's ID is not in the database. If it is, it has already been reported as updated
        for (const file of requestedMod.latestFiles) {
          if (dbProject.fileIds.includes(file.id.toString())) {
            await dbProject.updateDate(requestedMod.dateReleased);
            continue;
          }
        }

        // If we get here, the project has passed all verification checks and has a legitmate update available
        logger.info(`Update detected for CurseForge project ${dbProject.title} (${dbProject.id})`);

        await dbProject.updateDate(requestedMod.dateReleased);
        await dbProject.addFiles([requestedMod.latestFiles[requestedMod.latestFiles.length - 1].id]);

        await sendUpdateEmbed(requestedMod, dbProject, client);
      } else {
        logger.debug(`No update detected for ${dbProject.name}.`);
      }
    }
  }
  logger.debug("CurseForge update check complete.");

  // Process information returned from the Modrinth API and perform checks
  if (dbModrinthProjects.length) {
    for (const dbProject of dbModrinthProjects) {
      const requestedProject = requestedProjects.find((project) => project.id === dbProject.id);
      // Check if the project has been updated
      if (dbProject.dateUpdated.getTime() !== new Date(requestedProject.updated).getTime()) {
        // Verify that this file's ID is not in the database. If it is, it has already been reported as updated
        for (const fileId of requestedProject.versions) {
          if (dbProject.fileIds.includes(fileId)) {
            await dbProject.updateDate(requestedProject.updated);
            continue;
          }
        }

        // If we get here, the project has passed all verification checks and has a legitmate update available
        logger.info(`Update detected for Modrinth project ${dbProject.title} (${dbProject.id})`);

        await dbProject.updateDate(requestedProject.updated);
        await dbProject.addFiles(requestedProject.versions);

        await sendUpdateEmbed(requestedProject, dbProject, client);
      } else {
        logger.debug(`No update detected for ${dbProject.name}.`);
      }
    }
  }
  logger.debug("Modrinth update check complete.");
}

/**
 * Handles sending update notifications to the appropriate guild channels where a project is tracked
 * @param {*} requestedProject - The project's API data
 * @param {*} dbProject - The project's database data
 */
async function sendUpdateEmbed(requestedProject, dbProject, client) {
  let normalEmbed, compactEmbed, buttonRow;

  // Behavior is slightly different depending on platform, mostly dependent on the data returned from the initial earlier API call
  switch (dbProject.platform) {
    case "curseforge": {
      // Call the CurseForge API to get this file's changelog
      const responseData = await getModFileChangelog(requestedProject.id, requestedProject.latestFiles[requestedProject.latestFiles.length - 1].id);
      if (responseData) {
        if (responseData.statusCode === 200) {
          var rawChangelog = await getJSONResponse(responseData.body);
        } else {
          logger.warn(`Unexpected ${responseData.statusCode} status code while getting a file's changelog.`);
        }
      } else {
        logger.warn("A request to CurseForge timed out while checking projects for updates.");
      }

      // Since CurseForge returns changelogs in HTML format, we need to strip out HTML tags and special characters first
      const changelogNoHTML = rawChangelog.data.replace(/<br>/g, "\n").replace(/<.*?>/g, "");

      // Trim the changelog length
      const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
      const trimmedChangelog = trim(changelogNoHTML, 4000);

      const latestFile = requestedProject.latestFiles[requestedProject.latestFiles.length - 1];

      logger.info(`
				${requestedProject.name} latest file info:
				id: ${latestFile.id}
				displayName: ${latestFile.displayName}
				fileName: ${latestFile.fileName}
				releaseType: ${latestFile.releaseType}
				fileStatus: ${latestFile.fileStatus}
				fileDate: ${dayjs(latestFile.fileDate).format("YYYY-MM-DD HH:mm:ss")}
				hash0: ${latestFile.hashes[0].value} (algo: ${latestFile.hashes[0].algo})
				hash1: ${latestFile.hashes[1].value} (algo: ${latestFile.hashes[1].algo})
			`);

      // We create embeds for all types, but will only use one based on this guild's setttings
      normalEmbed = new EmbedBuilder()
        .setColor("#f87a1b")
        .setAuthor({
          name: "From curseforge.com",
          iconURL: "https://i.imgur.com/uA9lFcz.png",
          url: "https://curseforge.com",
        })
        .setTitle(`${requestedProject.name} has been updated`)
        .setDescription(`**Changelog:** ${codeBlock(trimmedChangelog)}`)
        .setThumbnail(`${requestedProject.logo.url}`)
        .setFields(
          { name: "Version Name", value: `${latestFile.displayName}` },
          { name: "Version Number", value: `${latestFile.fileName}` },
          {
            name: "Release Type",
            value: `${releaseTypeToString(latestFile.releaseType)}`,
          },
          {
            name: "Date Published",
            value: `<t:${dayjs(latestFile.fileDate).unix()}:f>`,
          }
        )
        .setTimestamp();

      compactEmbed = new EmbedBuilder()
        .setColor("#f87a1b")
        .setTitle(`${requestedProject.name} ${latestFile.displayName}`)
        .setURL(
          `https://www.curseforge.com/minecraft/${classIdToUrlString(requestedProject.classId)}/${requestedProject.slug}/files/${
            requestedProject.latestFilesIndexes[0].fileId
          }`
        )
        .setDescription(`${latestFile.fileName} (${releaseTypeToString(latestFile.releaseType)})`)
        .setFooter({
          text: `${dayjs(requestedProject.dateReleased).format("MMM D, YYYY")}`,
          iconURL: "https://i.imgur.com/uA9lFcz.png",
        });

      const viewButton = new ButtonBuilder()
        .setURL(
          `https://www.curseforge.com/minecraft/${classIdToUrlString(requestedProject.classId)}/${requestedProject.slug}/files/${
            requestedProject.latestFilesIndexes[0].fileId
          }`
        )
        .setLabel("View on CurseForge")
        .setStyle(ButtonStyle.Link);
      buttonRow = new ActionRowBuilder().addComponents(viewButton);

      break;
    }
    case "modrinth": {
      // Call the Modrinth API to get this version's information
      const responseData = await listProjectVersions(requestedProject.id);
      if (responseData) {
        if (responseData.statusCode === 200) {
          var requestedVersions = await getJSONResponse(responseData.body);
        } else {
          logger.warn(`Unexpected ${responseData.statusCode} status code while getting a version's information.`);
        }
      } else {
        logger.warn("A request to Modrinth timed out while checking projects for updates.");
      }

      const latestVersion = requestedVersions[0];

      // Trim the changelog length
      const trim = (str, max) => (str.length > max ? `${str.slice(0, max - 3)}...` : str);
      const trimmedDescription = trim(latestVersion.changelog, 4000);

      // We create embeds for all types, but will only use one based on this guild's setttings
      normalEmbed = new EmbedBuilder()
        .setColor("DarkGreen")
        .setAuthor({
          name: "From modrinth.com",
          iconURL: "https://i.imgur.com/2XDguyk.png",
          url: "https://modrinth.com",
        })
        .setTitle(`${requestedProject.title} has been updated`)
        .setDescription(`**Changelog:** ${codeBlock(trimmedDescription)}`)
        .setThumbnail(`${requestedProject.icon_url}`)
        .setFields(
          { name: "Version Name", value: `${latestVersion.name}` },
          { name: "Version Number", value: `${latestVersion.version_number}` },
          {
            name: "Release Type",
            value: `${capitalize(latestVersion.version_type)}`,
          },
          {
            name: "Date Published",
            value: `<t:${dayjs(latestVersion.date_published).unix()}:f>`,
          }
        )
        .setTimestamp();

      compactEmbed = new EmbedBuilder()
        .setColor("DarkGreen")
        .setTitle(`${requestedProject.title} ${latestVersion.name}`)
        .setURL(`https://modrinth.com/${requestedProject.project_type}/${requestedProject.slug}/version/${latestVersion.version_number}`)
        .setDescription(`${latestVersion.version_number} (${capitalize(latestVersion.version_type)})`)
        .setFooter({
          text: `${dayjs(latestVersion.date_published).format("MMM D, YYYY")}`,
          iconURL: "https://i.imgur.com/2XDguyk.png",
        });

      const viewButton = new ButtonBuilder()
        .setURL(`https://modrinth.com/${requestedProject.project_type}/${requestedProject.slug}/version/${latestVersion.version_number}`)
        .setLabel("View on Modrinth")
        .setStyle(ButtonStyle.Link);
      buttonRow = new ActionRowBuilder().addComponents(viewButton);

      break;
    }
    default:
      logger.warn("sendUpdateEmbed: invalid platform");
      break;
  }

  // Send the notification to each appropriate guild channel
  const trackedProjects = await TrackedProjects.findAll({
    where: {
      projectId: dbProject.id,
    },
  });

  for (const trackedProject of trackedProjects) {
    const guild = client.guilds.cache.get(trackedProject.guildId);
    const channel = guild.channels.cache.get(trackedProject.channelId);
    const guildSettings = await Guilds.findByPk(trackedProject.guildId);
    switch (guildSettings.notificationStyle) {
      case "compact":
        await channel.send({ embeds: [compactEmbed] });
        break;
      default:
        await channel.send({ embeds: [normalEmbed], components: [buttonRow] });
    }
  }
}

async function updatePresenceData(client) {
  const numberOfProjects = await Projects.count();

  client.user.setPresence({
    activities: [
      {
        type: ActivityType.Watching,
        name: `${numberOfProjects} projects for updates in ${client.guilds.cache.size} servers.`,
      },
    ],
    status: "online",
  });
}

function classIdToUrlString(classId) {
  switch (classId) {
    case 5:
      return "bukkit-plugins";
    case 6:
      return "mc-mods";
    case 12:
      return "texture-packs";
    case 17:
      return "worlds";
    case 4471:
      return "modpacks";
    case 4546:
      return "customization";
    case 4559:
      return "mc-addons";
    default:
      return "unknownClassIdValue";
  }
}

function releaseTypeToString(releaseType) {
  switch (releaseType) {
    case 1:
      return "Release";
    case 2:
      return "Beta";
    case 3:
      return "Alpha";
    default:
      return "UnknownReleaseType";
  }
}

function capitalize(string) {
  return string.replace(string.charAt(0), String.fromCharCode(string.charCodeAt(0) - 32));
}
