import winston from "winston";

const { combine, timestamp, printf, colorize } = winston.format;
const devFormat = printf(({ level, message, timestamp: ts, ...meta }) => {
  const metaStr = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
  return `${ts} [${level}] ${message}${metaStr}`;
});
const logger = winston.createLogger({
  level: "info",
  format: combine(colorize(), timestamp({ format: "HH:mm:ss" }), devFormat),
  transports: [new winston.transports.Console()],
});
export default logger;