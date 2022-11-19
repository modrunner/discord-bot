import logger from '../logger.js';
import { TrackedProjects, Guilds } from "../database/db.js";
import { Guild } from "discord.js";

export default {
	name: 'guildDelete',
	async execute(guild: Guild) {
		// Remove this guild's settings from the database
		await Guilds.destroy({
			where: {
				id: guild.id,
			}
		});

		// Remove this guild's tracked projects
		await TrackedProjects.destroy({
			where: {
				guildId: guild.id,
			},
		});

		logger.info(`Client left guild ${guild.name} (${guild.id}). Removed settings and tracked projects.`);
	},
};
