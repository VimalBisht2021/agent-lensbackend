const winston = require("winston");

const logger = winston.createLogger({
  level:
    process.env.NODE_ENV === "production"
      ? "info"
      : "debug",

  format: winston.format.combine(
    winston.format.timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),

  defaultMeta: { service: "algo-lens" },

  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ timestamp, level, message, ...meta }) =>
            `${timestamp} [${level}]: ${message}${
              Object.keys(meta).length > 1
                ? ` ${JSON.stringify(meta)}`
                : ""
            }`
        )
      ),
    }),
  ],
});

module.exports = logger;
