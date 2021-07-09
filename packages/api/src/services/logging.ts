import winston from "winston";
import morgan from "morgan";

const enumerateErrorFormat = winston.format((info) => {
  if (info instanceof Error) {
    Object.assign(info, { message: info.stack });
  }
  return info;
});

export const logger = winston.createLogger({
  level: process.env.env === "development" ? "debug" : "info",
  format: winston.format.combine(
    enumerateErrorFormat(),
    process.env.env === "development"
      ? winston.format.colorize()
      : winston.format.uncolorize(),
    winston.format.splat(),
    winston.format.printf(({ level, message }) => `${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ["error"],
    }),
  ],
});

morgan.token("message", (req, res) => res.locals.errorMessage || "");

const getIpFormat = () =>
  process.env.env === "production" ? ":remote-addr - " : "";
const successResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `${getIpFormat()}:method :url :status - :response-time ms - message: :message`;

export const morganSuccessHandler = morgan(successResponseFormat, {
  skip: ({ res }) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

export const morganErrorHandler = morgan(errorResponseFormat, {
  skip: ({ res }) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

export default {
  logger,
  morganSuccessHandler,
  morganErrorHandler,
};
