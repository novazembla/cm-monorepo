import { Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import multer from "multer";
import { mkdirSync } from "fs";
import { nanoid } from "nanoid";
import type { ApiFileMetaInformation } from "@culturemap/core";

import { logger } from "../services/serviceLogging";
import { fileCreate } from "../services/serviceFile";

import { getApiConfig } from "../config";
import { ApiError } from "../utils";
import { authAuthenticateUserByToken } from "../services/serviceAuth";

const apiConfigOnBoot = getApiConfig();

const storage = multer.diskStorage({
  destination: async (_req: Request, _file, cb) => {
    const uploadFolder = `csv/`;
    const uploadPath = `${apiConfigOnBoot.baseDir}/${apiConfigOnBoot.importDir}/${uploadFolder}`;

    try {
      mkdirSync(uploadPath, { recursive: true });
    } catch (e) {
      logger.error(e);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "[file] upload failed #1"
      );
    }

    cb(null, uploadPath);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${nanoid()}${extension}`);
  },
});

export const postFileUpload = multer({ storage });

const createFileMetaInfo = (
  file: Express.Multer.File
): {
  fileNanoId: string;
  metainfo: ApiFileMetaInformation;
} => {
  const apiConfig = getApiConfig();

  const extension = path.extname(file.originalname);

  const uploadFolder = file.destination.replace(
    `${apiConfig.baseDir}/${apiConfig.publicDir}`,
    ""
  );

  const fileNanoId = file.filename.replace(extension, "");

  const metainfo: ApiFileMetaInformation = {
    uploadFolder,
    originalFileName: file.filename,
    originalFileUrl: `${apiConfig.baseUrl.api}${uploadFolder}/${file.filename}`,
    originalFilePath: file.path,
    mimeType: file.mimetype,
    size: file.size,
  };

  return { fileNanoId, metainfo };
};

export const postFile = async (req: Request, res: Response) => {
  console.log("FILE FILE FILE");
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
        const { fileNanoId, metainfo } = createFileMetaInfo(req.file);

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
