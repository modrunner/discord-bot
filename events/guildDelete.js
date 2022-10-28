const logger = require('../logger');
const { TrackedProjects, Guilds } = require("../database/models");

module.exports = {
	name: 'guildDelete',
	async execute(guild) {
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
