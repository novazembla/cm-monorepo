import express, { Application } from "express";
import cors from "cors";

import cookieParser from "cookie-parser";
import { corsOptions } from "./config";
import {
  errorConvert404ToApiError,
  errorDisplayInResponse,
  errorProcessErrors,
} from "./middlewares/error";

import { morganErrorHandler, morganSuccessHandler } from "./middlewares/morgan";

export const app: Application = express();

export const initializeExpressApp = () => {
  app.use(cookieParser());

  // eslint-disable-next-line import/no-named-as-default-member
  app.use(cors(corsOptions));

  app.use(morganSuccessHandler);
  app.use(morganErrorHandler);
};

export const addTerminatingErrorHandlingToApp = () => {
  app.get("*", errorConvert404ToApiError);
  app.use(errorProcessErrors);
  app.use(errorDisplayInResponse);
};

export default app;
