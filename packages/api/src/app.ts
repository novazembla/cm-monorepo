import express, { Application, urlencoded } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { getApiConfig } from "./config";
import {
  errorConvert404ToApiError,
  errorDisplayInResponse,
  errorProcessErrors,
} from "./middlewares/error";

import { morganErrorHandler, morganSuccessHandler } from "./middlewares/morgan";
import {
  postImage,
  postProfileImage,
  postImageUpload,
  postFile,
  postFileUpload,
} from "./routes";

export const app: Application = express();

export const initializeExpressApp = () => {
  const apiConfig = getApiConfig();

  app.use(cookieParser());
  app.use(urlencoded({ extended: false }));

  // eslint-disable-next-line import/no-named-as-default-member
  app.use(cors(apiConfig.corsOptions));
  app.use(express.static("public"));
  app.use(morganSuccessHandler);
  app.use(morganErrorHandler);

  app.post("/profileImage", postImageUpload.single("image"), postProfileImage);
  app.post("/image", postImageUpload.single("image"), postImage);
  app.post("/file", postFileUpload.single("file"), postFile);
};

export const addTerminatingErrorHandlingToApp = () => {
  app.get("*", errorConvert404ToApiError);
  app.use(errorProcessErrors);
  app.use(errorDisplayInResponse);
};

export default app;
