import winston from "winston";

const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.splat(),
    winston.format.colorize(),
    winston.format.timestamp(),
    winston.format.printf((log) => {
      if (log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
      return `[${log.timestamp}] [${log.level}] ${log.message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({
      level: "error",
      filename: "logs/errors.log",
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
    }),
  ],
});

export default logger;
