import pino from "pino";

const logger = pino({
  level: "info",
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true, // Enables color formatting for console output
    },
  },
});

export default logger;
