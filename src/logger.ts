import { pino } from 'pino';
export default pino({
  level: process.env.LOGGING_LEVEL ?? 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      ignore: 'pid,hostname',
      translateTime: 'yyyy-mm-dd HH:MM:ss',
    },
  },
});
