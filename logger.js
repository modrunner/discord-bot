const pino = require('pino');

const logger = pino({
  level: process.env.LOGGING_LEVEL ?? 'info',
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          ignore: process.env.DOPPLER_ENVIRONMENT === 'dev' ? 'pid,hostname' : 'pid,hostname',
          translateTime: 'SYS:yyyy-mm-dd hh:MM:s:l TT',
        },
      },
      {
        target: '@logtail/pino',
        options: { sourceToken: process.env.BETTERSTACK_SOURCE_TOKEN },
      },
    ],
  },
});

module.exports = logger;
