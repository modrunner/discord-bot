const { Projects } = require('../dbObjects');
const logger = require('../logger');

module.exports = {
	name: 'guildDelete',
	async execute(guild) {
		const deletedProjects = await Projects.destroy({
			where: {
				guild_id: guild.id,
			},
		});
		logger.info(`Client was kicked from guild ${guild.name} (${guild.id}) or was guild was deleted. Removed ${deletedProjects} projects from tracking.`);
	},
};