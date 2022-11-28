const pino = require('pino');

const logger = pino({
  level: process.env.LOGGING_LEVEL ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
    },
  },
});

module.exports = logger;
