import { Model, Sequelize } from "sequelize";
import { getProject, getMod, validateIdOrSlug } from "../api/apiMethods.js";
import getJSONResponse from "../api/getJSONResponse";

const sequelize = new Sequelize("database", "user", "password", {
  host: "localhost",
  dialect: "sqlite",
  logging: false,
  storage: "./database/database.sqlite",
});

// Tables
import Guilds from './models/Guild.js';
import Projects from './models/Project.js';
import TrackedProjects from './models/TrackedProject.js';

Reflect.defineProperty(Projects, "fetch", {
  value: async function (projectId: string): Promise<Model | null> {
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
        platform: "modrinth",
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
        platform: "curseforge",
        dateUpdated: data.data.dateReleased,
        fileIds: fileIds,
      });
    }
  },
});

module.exports = { sequelize, Guilds, Projects, TrackedProjects };
