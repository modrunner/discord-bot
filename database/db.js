const Sequelize = require('sequelize');
const { getMod } = require('../api/curseforge');
const { getProject, validateIdOrSlug } = require('../api/modrinth');
const getJSONResponse = require('../api/getJSONResponse');

const sequelize = new Sequelize('database', 'user', 'password', {
  host: 'localhost',
  dialect: 'sqlite',
  logging: false,
  storage: './database/db_v4.sqlite',
});

// Tables
const Guilds = require('./models/Guild')(sequelize, Sequelize.DataTypes);
const Projects = require('./models/Project')(sequelize, Sequelize.DataTypes);
const TrackedProjects = require('./models/TrackedProject')(sequelize, Sequelize.DataTypes);

Reflect.defineProperty(Guilds.prototype, 'setChangelogMaxLength', {
  value: async function (length) {
    this.changelogLength = length;
    await this.save();
  },
});

Reflect.defineProperty(Guilds.prototype, 'setMaxTrackedProjects', {
  value: async function (max) {
    this.maxProjects = max;
    await this.save();
  },
});

Reflect.defineProperty(Guilds.prototype, 'setNotificationStyle', {
  value: async function (style) {
    this.notificationStyle = style;
    await this.save();
  },
});

Reflect.defineProperty(Projects.prototype, 'updateDate', {
  value: async function (date) {
    this.dateUpdated = date;
    await this.save();
  },
});

Reflect.defineProperty(Projects.prototype, 'updateName', {
  value: async function (name) {
    this.name = name;
    await this.save();
  },
});

Reflect.defineProperty(Projects.prototype, 'addFiles', {
  value: async function (files) {
    const fileIds = this.fileIds;
    for (const file of files) {
      fileIds.push(file);
      // if (fileIds.length > 10) {
      //   fileIds.shift();
      // }
    }
    return await Projects.update(
      {
        fileIds: fileIds,
      },
      {
        where: {
          id: this.id,
        },
      }
    );
  },
});

Reflect.defineProperty(TrackedProjects.prototype, 'addRoles', {
  value: async function (roles) {
    const roleIds = this.roleIds ?? [];
    for (const role of roles) {
      roleIds.push(role.id);
    }
    return await TrackedProjects.update(
      {
        roleIds: roleIds,
      },
      {
        where: {
          projectId: this.projectId,
          guildId: this.guildId,
          channelId: this.channelId,
        },
      }
    );
  },
});

Reflect.defineProperty(TrackedProjects.prototype, 'addRolesUsingIds', {
  value: async function (roleIds) {
    return await TrackedProjects.update(
      {
        roleIds: roleIds,
      },
      {
        where: {
          projectId: this.projectId,
          guildId: this.guildId,
          channelId: this.channelId,
        },
      }
    );
  },
});

Reflect.defineProperty(Projects.prototype, 'track', {
  value: async function (guildId, channelId) {
    return await TrackedProjects.findOrCreate({
      where: {
        projectId: this.id,
        projectPlatform: this.platform,
        guildId: guildId,
        channelId: channelId,
      },
      defaults: {
        projectId: this.id,
        projectPlatform: this.platform,
        guildId: guildId,
        channelId: channelId,
      },
    });
  },
});

Reflect.defineProperty(Projects, 'fetch', {
  value: async function (projectId) {
    if (projectId.match(/[A-z]/)) {
      const validationResponse = await validateIdOrSlug(projectId);
      if (validationResponse.statusCode !== 200) return null;

      const validatedData = await getJSONResponse(validationResponse.body);
      const validatedId = validatedData.id;

      const project = await this.findByPk(validatedId);
      if (project) return project;

      const response = await getProject(validatedId);
      if (response.statusCode !== 200) return null;

      const data = await getJSONResponse(response.body);
      return await this.create({
        id: data.id,
        name: data.title,
        platform: 'Modrinth',
        dateUpdated: data.updated,
        fileIds: data.versions,
      });
    } else {
      const project = await this.findByPk(projectId);
      if (project) return project;

      const response = await getMod(projectId);
      if (response.statusCode !== 200) return null;

      const data = await getJSONResponse(response.body);
      const fileIds = [];
      for (const file of data.data.latestFiles) {
        fileIds.push(file.id);
      }
      return await this.create({
        id: data.data.id,
        name: data.data.name,
        platform: 'CurseForge',
        dateUpdated: data.data.dateReleased,
        fileIds: fileIds,
        gameId: data.data.gameId,
      });
    }
  },
});

module.exports = { sequelize, Guilds, Projects, TrackedProjects };
