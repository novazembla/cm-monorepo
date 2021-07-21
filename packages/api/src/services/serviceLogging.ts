import winston from "winston";
import { ApiError } from "../utils";

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const getLogLevel = () =>
  process?.env?.NODE_ENV === "development" ? "debug" : "warn";

const colors = {
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  debug: "white",
};

winston.addColors(colors);

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error || info instanceof ApiError) {
    Object.assign(info, {
      message:
        process.env.NODE_ENV === "development"
          ? info.stack
          : `${info.name} ${info.message}`,
    });
  }
  return info;
});

const format = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss:ms" }),
  enumerateErrorFormat(),
  process.env.env === "development"
    ? winston.format.colorize({ all: true })
    : winston.format.uncolorize(),
  winston.format.splat(),
  winston.format.printf(
    ({ timestamp, level, message }) => `${timestamp} [${level}]: ${message}`
  )
);

const transports: Array<winston.transport> = [new winston.transports.Console()];

if (process.env.NODE_ENV && process.env.NODE_ENV !== "production") {
  transports.push(
    new winston.transports.File({
      filename: "./logs/error.log",
      level: "error",
      handleExceptions: true,
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
  transports.push(
    new winston.transports.File({
      filename: "./logs/all.log",
      level: "debug",
    })
  );
}

export const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  format,
  transports,
  exitOnError: false,
});

export default logger;
