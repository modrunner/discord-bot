module.exports = {
	updatePresenceData(client, numberOfProjects) {
		client.user.setPresence({
			activities: [{
				type: 'PLAYING',
				name: `Monitoring ${numberOfProjects} projects for updates in ${client.guilds.cache.size} servers.`,
			}],
			status: 'online',
		});
	},
};