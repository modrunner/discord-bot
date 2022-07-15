const { GuildSettings } = require('../dbObjects');
const logger = require('../logger');

module.exports = {
	name: 'guildCreate',
	async execute(guild) {
		await GuildSettings.create({
			guild_id: guild.id,
		});
		logger.info(`Client joined guild ${guild.name} (${guild.id}). Initialized settings for guild in database.`);
	},
};