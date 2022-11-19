import { Guilds } from '../database/db.js';
import logger from '../logger.js';
import { Guild } from "discord.js";

export default {
	name: 'guildCreate',
	async execute(guild: Guild) {
    // Add settings to database for guild
    await Guilds.create({
      id: guild.id,
    });

    logger.info(`Client was invited to guild ${guild.name} (${guild.id}). Initialized settings.`);
	},
};
