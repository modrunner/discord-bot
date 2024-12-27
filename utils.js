const { ChannelType } = require('discord-api-types/v10');
const { getModFileChangelog } = require('./api/curseforge');
const logger = require('./logger');
const getJSONResponse = require('./api/getJSONResponse');
const { listProjectVersions } = require('./api/modrinth');
const { TrackedProjects, Guilds } = require('./database/db');
const { EmbedBuilder, codeBlock, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const dayjs = require('dayjs');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

module.exports = {
  /**
   * Handles sending update notifications to the appropriate guild channels where a project is tracked
   * @param {*} requestedProject - The project's API data
   * @param {*} dbProject - The project's database data
   */
  async sendUpdateEmbed(requestedProject, dbProject, client) {
    let versionData;

    // Behavior is slightly different depending on platform, mostly dependent on the data returned from the initial earlier API call
    switch (dbProject.platform) {
      case 'CurseForge': {
        // Call the CurseForge API to get this file's changelog
        const response = await getModFileChangelog(requestedProject.id, requestedProject.latestFiles[requestedProject.latestFiles.length - 1].id);
        if (!response) return logger.warn("A request to CurseForge timed out while getting a project file's changelog");
        if (response.statusCode !== 200) return logger.warn(`Unexpected ${response.statusCode} status code while getting a project files's changelog.`);

        const rawData = await getJSONResponse(response.body);
        versionData = {
          changelog: rawData.data,
          date: requestedProject.latestFiles[requestedProject.latestFiles.length - 1].fileDate,
          iconURL: requestedProject.logo.url,
          name: requestedProject.latestFiles[requestedProject.latestFiles.length - 1].displayName,
          number: requestedProject.latestFiles[requestedProject.latestFiles.length - 1].fileName,
          type: capitalize(releaseTypeToString(requestedProject.latestFiles[requestedProject.latestFiles.length - 1].releaseType)),
          url: `https://www.curseforge.com/minecraft/${classIdToUrlString(requestedProject.classId)}/${requestedProject.slug}/files/${
            requestedProject.latestFilesIndexes[0].fileId
          }`,
        };

        logger.debug(versionData);

        break;
      }
      case 'Modrinth': {
        // Call the Modrinth API to get this version's information
        const response = await listProjectVersions(requestedProject.id);
        if (!response) return logger.warn("A request to Modrinth timed out while getting a project's version information");
        if (response.statusCode !== 200) return logger.warn(`Unexpected ${response.statusCode} status code while getting a project's version information.`);

        const rawData = await getJSONResponse(response.body);
        versionData = {
          changelog: rawData[0].changelog,
          date: rawData[0].date_published,
          iconURL: requestedProject.icon_url,
          name: rawData[0].name,
          number: rawData[0].version_number,
          type: capitalize(rawData[0].version_type),
          url: `https://modrinth.com/${requestedProject.project_type}/${requestedProject.slug}/version/${rawData[0].id}`,
        };

        logger.debug(versionData);

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

      // Check to see if Modrunner has permissions to post in the update channel
      if (!channel.viewable || !channel.permissionsFor(client.user.id).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
        logger.warn(
          `Could not post notification in channel ${channel.name} (${channel.id}) in guild ${guild.name} (${guild.id}) due to insufficient permissions.`
        );
        continue;
      }

      const guildSettings = await Guilds.findByPk(trackedProject.guildId);

      const roleIds = trackedProject.roleIds;
      let mentionableRoles;
      let rolesString;
      if (roleIds) {
        mentionableRoles = roleIds.map((roleId) => `<@&${roleId}>`);
        rolesString = mentionableRoles.join(' ');
      }

      switch (guildSettings.notificationStyle) {
        case 'alt':
          if (channel.type === ChannelType.GuildForum) {
            await channel.threads
              .create({
                name: `${versionData.name}`,
                message: {
                  content: roleIds ? `${rolesString}` : null,
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor(embedAuthorData(dbProject.platform))
                      .setColor(embedColorData(dbProject.platform))
                      .setDescription(`${trimChangelog(versionData.changelog, guildSettings.changelogLength)}`)
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
                      .setThumbnail(versionData.iconURL)
                      .setTimestamp()
                      .setTitle(`${dbProject.name} has been updated`),
                  ],
                  components: [
                    new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setLabel(`View on ${dbProject.platform}`).setStyle(ButtonStyle.Link).setURL(versionData.url)
                    ),
                  ],
                },
              })
              .catch((error) => logger.error(error));
          } else {
            await channel.send({
              content: roleIds ? `${rolesString}` : null,
              embeds: [
                new EmbedBuilder()
                  .setAuthor(embedAuthorData(dbProject.platform))
                  .setColor(embedColorData(dbProject.platform))
                  .setDescription(`${trimChangelog(versionData.changelog, guildSettings.changelogLength)}`)
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
                  .setThumbnail(versionData.iconURL)
                  .setTimestamp()
                  .setTitle(`${dbProject.name} has been updated`),
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setLabel(`View on ${dbProject.platform}`).setStyle(ButtonStyle.Link).setURL(versionData.url)
                ),
              ],
            });
          }
          logger.info(
            `Sent ${guildSettings.notificationStyle} notification for project ${dbProject.name} (${dbProject.id}) in guild ${channel.guild.name} (${channel.guild.id}) in channel ${channel.name} (${channel.id}) for version ${versionData.name} (${versionData.number})`
          );
          break;
        case 'compact':
          if (channel.type === ChannelType.GuildForum) {
            await channel.threads.create({
              name: `${versionData.name}`,
              message: {
                content: roleIds ? `${rolesString}` : null,
                embeds: [
                  new EmbedBuilder()
                    .setColor(embedColorData(dbProject.platform))
                    .setDescription(`${versionData.number} (${versionData.type})`)
                    .setFooter({
                      text: `${dayjs(versionData.date).format('MMM D, YYYY')}`,
                      iconURL: embedAuthorData(dbProject.platform).iconURL ?? null,
                    })
                    .setTitle(`${dbProject.name} ${versionData.name}`)
                    .setURL(versionData.url),
                ],
              },
            });
          } else {
            await channel.send({
              content: roleIds ? `${rolesString}` : null,
              embeds: [
                new EmbedBuilder()
                  .setColor(embedColorData(dbProject.platform))
                  .setDescription(`${versionData.number} (${versionData.type})`)
                  .setFooter({
                    text: `${dayjs(versionData.date).format('MMM D, YYYY')}`,
                    iconURL: embedAuthorData(dbProject.platform).iconURL ?? null,
                  })
                  .setTitle(`${dbProject.name} ${versionData.name}`)
                  .setURL(versionData.url),
              ],
            });
          }
          logger.info(
            `Sent ${guildSettings.notificationStyle} notification for project ${dbProject.name} (${dbProject.id}) in guild ${channel.guild.name} (${channel.guild.id}) in channel ${channel.name} (${channel.id}) for version ${versionData.name} (${versionData.number})`
          );
          break;
        case 'ai': {
          const response = await openai.createChatCompletion({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'user',
                content: `Create an announcement with a professional tone for an update to ${dbProject.name} on ${dbProject.platform}. 
								The new version is ${versionData.name}, it's a ${versionData.type} release, and the changelog is: ${trimChangelog(versionData.changelog)}. 
								Use markdown formatting to highlight important information`,
              },
            ],
            max_tokens: 1024,
            n: 1,
          });
          logger.debug(response.data);

          if (channel.type === ChannelType.GuildForum) {
            await channel.threads.create({
              name: `${versionData.name}`,
              message: {
                content: `${response.data.choices[0].message.content}\n${rolesString}`,
              },
            });
          } else {
            await channel.send({
              content: `${response.data.choices[0].message.content}\n${rolesString}`,
            });
          }
          logger.info(
            `Sent ${guildSettings.notificationStyle} notification for project ${dbProject.name} (${dbProject.id}) in guild ${channel.guild.name} (${channel.guild.id}) in channel ${channel.name} (${channel.id}) for version ${versionData.name} (${versionData.number})`
          );
          break;
        }
        default:
          if (channel.type === ChannelType.GuildForum) {
            await channel.threads
              .create({
                name: `${versionData.name}`,
                message: {
                  content: roleIds ? `${rolesString}` : null,
                  embeds: [
                    new EmbedBuilder()
                      .setAuthor(embedAuthorData(dbProject.platform))
                      .setColor(embedColorData(dbProject.platform))
                      .setDescription(`**Changelog:** ${codeBlock(trimChangelog(versionData.changelog, guildSettings.changelogLength))}`)
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
                      .setThumbnail(versionData.iconURL)
                      .setTimestamp()
                      .setTitle(`${dbProject.name} has been updated`),
                  ],
                  components: [
                    new ActionRowBuilder().addComponents(
                      new ButtonBuilder().setLabel(`View on ${dbProject.platform}`).setStyle(ButtonStyle.Link).setURL(versionData.url)
                    ),
                  ],
                },
              })
              .catch((error) => logger.error(error));
          } else {
            await channel.send({
              content: roleIds ? `${rolesString}` : null,
              embeds: [
                new EmbedBuilder()
                  .setAuthor(embedAuthorData(dbProject.platform))
                  .setColor(embedColorData(dbProject.platform))
                  .setDescription(`**Changelog:** ${codeBlock(trimChangelog(versionData.changelog, guildSettings.changelogLength))}`)
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
                  .setThumbnail(versionData.iconURL)
                  .setTimestamp()
                  .setTitle(`${dbProject.name} has been updated`),
              ],
              components: [
                new ActionRowBuilder().addComponents(
                  new ButtonBuilder().setLabel(`View on ${dbProject.platform}`).setStyle(ButtonStyle.Link).setURL(versionData.url)
                ),
              ],
            });
          }
          logger.info(
            `Sent ${guildSettings.notificationStyle} notification for project ${dbProject.name} (${dbProject.id}) in guild ${channel.guild.name} (${channel.guild.id}) in channel ${channel.name} (${channel.id}) for version ${versionData.name} (${versionData.number})`
          );
      }
    }
  },
};

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
    case 'CurseForge':
      return {
        name: 'From curseforge.com',
        iconURL: 'https://i.imgur.com/uA9lFcz.png',
        url: 'https://curseforge.com',
      };
    case 'Modrinth':
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
    case 'CurseForge':
      return '#f87a1b';
    case 'Modrinth':
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
