import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import config from "./config";

export const app: express.Application = express();

export const initializeExpressApp = () => {
  app.use(cookieParser());

  // eslint-disable-next-line import/no-named-as-default-member
  app.use(cors(config.cors));
};

export default app;
