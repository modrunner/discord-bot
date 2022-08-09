const { GuildSettings, Projects, TrackedProjects } = require('../dbObjects');

truncateTable();
async function truncateTable() {
	switch (process.argv[2]) {
	case 'Projects':
		await Projects.destroy({
			truncate: true,
		});
		return console.log('Projects table truncated.');
	case 'guild_settings':
		await GuildSettings.destroy({
			truncate: true,
		});
		return console.log('guild_settings table truncated.');
	case 'tracked_projects':
		await TrackedProjects.destroy({
			truncate: true,
		});
		return console.log('tracked_projects table truncated.');
	default:
		return console.log('No table exists with that name.');
	}
}
