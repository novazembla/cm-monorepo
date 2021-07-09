import httpStatus from "http-status";

import { logger } from "../services/logging";

import ApiError from "../utils/classApiError";

export const errorConverter = ({ err, next }) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    // const statusCode =
    //   error.statusCode || error instanceof mongoose.Error ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const statusCode = error.statusCode || httpStatus.INTERNAL_SERVER_ERROR; // TODO: fix mongoose above
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  next(error);
};

// eslint-disable-next-line no-unused-vars
export const errorHandler = ({ err, res }) => {
  let { statusCode, message } = err;
  if (process.env.env === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const response = {
    code: statusCode,
    message,
    ...(process.env.env === "development" && { stack: err.stack }),
  };

  if (process.env.env === "development") {
    logger.error(err);
  }

  res.status(statusCode).send(response);
};

export default {
  errorConverter,
  errorHandler,
};
