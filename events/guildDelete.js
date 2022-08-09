const { GuildSettings, TrackedProjects } = require('../dbObjects');
const logger = require('../logger');

module.exports = {
	name: 'guildDelete',
	async execute(guild) {
		await GuildSettings.destroy({
			where: {
				guild_id: guild.id,
			},
		});


		const dbProjects = await TrackedProjects.findAll();
		for (const dbProject of dbProjects) {
			const dbGuilds = dbProject.guild_data.guilds;
			const newData = { guilds: [] };
			for (const dbGuild of dbGuilds) {
				if (dbGuild.id != guild.id) {
					newData.guilds.push(dbGuild);
				}
			}

			if (newData.guilds.length === 0) {
				await TrackedProjects.destroy({
					where: {
						id: dbProject.id,
					},
				});
			} else {
				await TrackedProjects.update({
					guild_data: newData,
				}, {
					where: {
						id: dbProject.id,
					},
				});
			}
		}


		logger.info(`Client was kicked from guild ${guild.name} (${guild.id}) or was guild was deleted. Removed guild information from tracked projects and removed all settings.`);
	},
};