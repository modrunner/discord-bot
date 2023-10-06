module.exports = {
	apps: [
		{
			name: 'modrunner-staging',
			script: 'npm run start',
			watch: true,
			ignore_watch: ['node_modules', 'db_v4.sqlite'],
			min_uptime: '10s',
			max_restarts: 10,
		}
	]
}