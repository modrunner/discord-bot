const pino = require('pino');
const { loggerLevel } = require('./config.json');
const transport = pino.transport({
	target: 'pino-pretty',
	options: {
		colorize: false,
		destination: './bot.log',
		ignore: 'pid,hostname',
		translateTime: 'yyyy-mm-dd HH:MM:ss',
	},
});
const logger = pino(transport);
logger.level = loggerLevel;
module.exports = logger;