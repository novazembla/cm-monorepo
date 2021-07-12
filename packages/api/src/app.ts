import express from "express";
import cors from "cors";
import config from "./config";

export const app: express.Application = express();

export const initializeExpressApp = () => {
  // eslint-disable-next-line import/no-named-as-default-member
  app.use(cors(config.cors));
};

export default app;
