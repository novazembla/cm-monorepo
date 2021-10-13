import express, {
  Application,
  NextFunction,
  Request,
  Response,
  urlencoded,
} from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { getApiConfig } from "./config";
import {
  errorConvert404ToApiError,
  errorDisplayInResponse,
  errorProcessErrors,
} from "./middlewares/error";

import { morganErrorHandler, morganSuccessHandler } from "./middlewares/morgan";
import { ApiError } from "./utils";
import {
  postImage,
  postProfileImage,
  postImageUpload,
  postFile,
  postFileUpload,
  postImportFile,
  postImportFileUpload,
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
  app.post("/import", postImportFileUpload.single("file"), postImportFile);

  // TODO: openar
  app.use(
    (
      err: Error | ApiError,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      if (res.headersSent) {
        return next(err);
      }

      if (err instanceof ApiError) {
        res.status(err?.statusCode ?? 500);
        res.json({
          error: {
            name: err.name,
            message: err.message,
            statusCode: err?.statusCode,
            isOperational:
              typeof err?.isOperational !== "undefined"
                ? !!err?.isOperational
                : true,
          },
        });
      } else {
        res.status(500);
        res.json({
          error: {
            name: err.name,
            message: err.message,
          },
        });
      }
    }
  );
};

export const addTerminatingErrorHandlingToApp = () => {
  app.get("*", errorConvert404ToApiError);
  app.use(errorProcessErrors);
  app.use(errorDisplayInResponse);
};

export default app;
