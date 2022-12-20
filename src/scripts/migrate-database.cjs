/* eslint-disable @typescript-eslint/no-var-requires */
const { PrismaClient } = require('@prisma/client');
const projects = require('./projects.json');
const trackedProjects = require('./trackedProjects.json');
const guilds = require('./guilds.json');

async function run() {
  const prisma = new PrismaClient();

  for (const project of projects) {
    if (project.platform === 'curseforge') {
      if (project.fileIds[project.fileIds.length - 2]) {
        await prisma.curseforgeProject.create({
          data: {
            id: project.id,
            name: project.name,
            dateUpdated: new Date(project.dateUpdated),
            latestFileId: project.fileIds[project.fileIds.length - 1].toString(),
            secondLatestFileId: project.fileIds[project.fileIds.length - 2].toString(),
          },
        });
      } else {
        await prisma.curseforgeProject.create({
          data: {
            id: project.id,
            name: project.name,
            dateUpdated: new Date(project.dateUpdated),
            latestFileId: project.fileIds[project.fileIds.length - 1].toString(),
          },
        });
      }
    } else {
      await prisma.modrinthProject.create({
        data: {
          id: project.id,
          name: project.name,
          dateUpdated: new Date(project.dateUpdated),
          latestFileId: project.fileIds[project.fileIds.length - 1],
        },
      });
    }
  }

  for (const guild of guilds) {
    await prisma.discordGuild.create({
      data: {
        id: guild.id,
        changelogMaxLength: guild.changelogMaxLength,
        maxTrackedProjects: guild.maxTrackedProjects,
        notificationStyle: guild.notificationStyle,
      },
    });
  }

  for (const project of trackedProjects) {
    if (!project.projectId.toString().match(/[A-z]/)) {
      await prisma.curseforgeTrackedProject.create({
        data: {
          projectId: project.projectId,
          guildId: project.guildId,
          channelId: project.channelId,
        },
      });
    } else {
      await prisma.modrinthTrackedProject.create({
        data: {
          projectId: project.projectId,
          guildId: project.guildId,
          channelId: project.channelId,
        },
      });
    }
  }
}

(async () => {
  await run();
})();
