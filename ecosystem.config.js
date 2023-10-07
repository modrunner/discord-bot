module.exports = {
	apps: [
		{
			name: 'modrunner-bot',
			script: 'npm run start',
			watch: true,
			ignore_watch: ['node_modules', 'db_v4.sqlite'],
			min_uptime: '30s',
			max_restarts: 5,
		}
	]
}