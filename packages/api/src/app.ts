// TODO: Make use of https://github.com/godaddy/terminus https://stackoverflow.com/questions/43003870/how-do-i-shut-down-my-express-server-gracefully-when-its-process-is-killed
//

import express, { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";
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
  app.use(cors(config.corsOptions));

  app.use(morganSuccessHandler);
  app.use(morganErrorHandler);
};

export const addTerminatingErrorHandlingToApp = () => {
  app.get("*", errorConvert404ToApiError);
  app.use(errorProcessErrors);
  app.use(errorDisplayInResponse);
};

export default app;
