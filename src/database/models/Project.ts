import type { Model, Sequelize } from "sequelize";
import TrackedProjects from "./TrackedProject.js";


export default (sequelize: Sequelize, DataTypes: any) => {
	const Project = sequelize.define('project', {
		id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		name: {
			type: DataTypes.STRING,
		},
		platform: {
			type: DataTypes.ENUM,
			values: ['curseforge', 'modrinth'],
			allowNull: false,
		},
		dateUpdated: {
			type: DataTypes.DATE,
			allowNull: false,
		},
		fileIds: {
			type: DataTypes.JSON,
			defaultValue: [],
		},
	}, {
		timestamps: false,
	});

	Reflect.defineProperty(Project.prototype, "updateDate", {
		value: async function (date: Date): Promise<void> {
			this.dateUpdated = date;
			await this.save();
		},
	});

	Reflect.defineProperty(Project.prototype, "addFiles", {
		value: async function (files: string[]): Promise<void> {
			const fileIds = this.fileIds;
			for (const file of files) {
				fileIds.push(file);
				if (fileIds.length > 10) {
					fileIds.shift();
				}
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

	Reflect.defineProperty(Project.prototype, "track", {
		value: async function (guildId: string, channelId: string): Promise<Model> {
			return await TrackedProjects.findOrCreate({
				where: {
					projectId: this.id,
					guildId: guildId,
					channelId: channelId,
				},
				defaults: {
					projectId: this.id,
					guildId: guildId,
					channelId: channelId,
				},
			});
		},
	});

	return Project;
};
