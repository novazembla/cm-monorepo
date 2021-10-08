import { Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import multer from "multer";
import { nanoid } from "nanoid";

import { logger } from "../services/serviceLogging";
import { fileCreate, fileGetUploadInfo } from "../services/serviceFile";

import { ApiError } from "../utils";
import { createFileMetaInfo } from ".";
import { authAuthenticateUserByToken } from "../services/serviceAuth";

const storage = multer.diskStorage({
  destination: async (_req: Request, _file, cb) => {
    let uploadInfo: any;
    try {
      uploadInfo = await fileGetUploadInfo(false);
    } catch (e) {
      logger.error(e);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "[file] upload failed #1"
      );
    }

    if (!uploadInfo?.path)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "[file] upload failed #2"
      );

    cb(null, uploadInfo.path);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${nanoid()}${extension}`);
  },
});

export const postFileUpload = multer({ storage });

export const postFile = async (req: Request, res: Response) => {
  const refreshToken = req?.cookies?.refreshToken ?? "";
  if (refreshToken) {
    try {
      const apiUserInRefreshToken = authAuthenticateUserByToken(refreshToken);
      if (apiUserInRefreshToken) {
        if (apiUserInRefreshToken.id !== parseInt(req.body.ownerId)) {
          throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
        }
      }
    } catch (Err) {
      throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    }
  } else {
    throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
  }

  try {
    if (req.body.ownerId && !Number.isNaN(req.body.ownerId)) {
      if (req.file) {
        const { fileNanoId, metainfo } = createFileMetaInfo(req.file, false);

        let connectWith;
        try {
          connectWith = req?.body?.connectWith
            ? JSON.parse(req?.body?.connectWith)
            : {};
        } catch (err) {
          // nothing to be done ...
        }

        const file = await fileCreate(
          parseInt(req.body.ownerId, 10),
          fileNanoId,
          metainfo,
          connectWith
        );

        res.json(file);
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "File upload failed #1");
      }
    } else {
      throw new ApiError(httpStatus.BAD_REQUEST, "File upload failed #2");
    }
  } catch (err) {
    logger.error(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "File upload failed #3"
    );
  }
};
export default postFile;
