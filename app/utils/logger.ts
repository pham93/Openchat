import pino from "pino";

const logger = pino({
  level: "debug",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true, // Enables color formatting for console output
      translateTime: "yyyy-mm-dd HH:MM:ss",
    },
  },
});

export const createLogger = (name: string) =>
  logger.child({ name }, { msgPrefix: `[${name}] - ` });
