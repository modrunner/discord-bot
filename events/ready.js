const logger = require('./../logger');
const ms = require('ms');
const { checkForProjectUpdates } = require('../util/checkForProjectUpdates');

module.exports = {
	name: 'ready',
	async execute(client) {
		logger.info(`Bot online, logged in as ${client.user.tag}`);

		checkForProjectUpdates(client);
		setInterval(runUpdateCheck, ms('10m'));

		async function runUpdateCheck() {
			checkForProjectUpdates(client);
		}
	},
};