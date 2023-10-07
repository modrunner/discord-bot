module.exports = {
	apps: [
		{
			name: 'modrunner-bot',
			script: 'npm run start',
			watch: true,
			ignore_watch: ['node_modules', '*.sqlite'],
			min_uptime: '30s',
			max_restarts: 5,
		}
	]
}