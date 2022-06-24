const pino = require('pino');
const { env } = require('./config.json');

const outputToConsole = pino.transport({
	target: 'pino-pretty',
	options: {
		ignore: 'pid,hostname',
		translateTime: 'yyyy-mm-dd HH:MM:ss',
	},
});
const outputToFile = pino.transport({
	target: 'pino-pretty',
	options: {
		append: false,
		colorize: false,
		destination: './bot.log',
		ignore: 'pid,hostname',
		translateTime: 'yyyy-mm-dd HH:MM:ss',
	},
});

const logger = pino((env === 'dev') ? outputToConsole : outputToFile);
logger.level = (env === 'dev') ? 'trace' : 'info';

module.exports = logger;