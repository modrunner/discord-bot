const pino = require('pino');

const logger = pino({
  level: process.env.LOGGING_LEVEL ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: process.env.DOPPLER_ENVIRONMENT === 'dev' ? 'pid,hostname' : 'pid,hostname,time',
    },
  },
});

module.exports = logger;
