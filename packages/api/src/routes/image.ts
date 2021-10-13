import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import multer from "multer";

import { nanoid } from "nanoid";
import type { ApiImageMetaInformation } from "@culturemap/core";

import { logger } from "../services/serviceLogging";
import { imageCreate, imageGetUploadInfo } from "../services/serviceImage";

import { getApiConfig } from "../config";
import { ApiError } from "../utils";
import { authAuthenticateUserByToken } from "../services/serviceAuth";

const storage = multer.diskStorage({
  destination: async (_req: Request, _file, cb) => {
    let uploadInfo: any;
    try {
      uploadInfo = await imageGetUploadInfo();
    } catch (e) {
      logger.error(e);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "[image] upload failed #1"
      );
    }

    if (!uploadInfo?.path)
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "[image] upload failed #2"
      );

    cb(null, uploadInfo.path);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${nanoid()}${extension}`);
  },
});

export const postImageUpload = multer({ storage });

const createImageMetaInfo = (
  file: Express.Multer.File
): {
  fileNanoId: string;
  metainfo: ApiImageMetaInformation;
} => {
  const apiConfig = getApiConfig();

  const extension = path.extname(file.originalname);

  const uploadFolder = file.destination.replace(
    `${apiConfig.baseDir}/${apiConfig.publicDir}`,
    ""
  );

  const fileNanoId = file.filename.replace(extension, "");

  const metainfo: ApiImageMetaInformation = {
    uploadFolder,
    originalFileName: file.filename,
    originalFileUrl: `${apiConfig.baseUrl.api}${uploadFolder}/${file.filename}`,
    originalFilePath: file.path,
    mimeType: file.mimetype,
    imageType: "square",
    size: file.size,
  };

  return { fileNanoId, metainfo };
};

export const postImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: enable access restrictions
    // const refreshToken = req?.cookies?.refreshToken ?? "";
    // if (refreshToken) {
    //   try {
    //     const apiUserInRefreshToken = authAuthenticateUserByToken(refreshToken);
    //     if (apiUserInRefreshToken) {
    //       if (apiUserInRefreshToken.id !== parseInt(req.body.ownerId)) {
    //         throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    //       }
    //     }
    //   } catch (Err) {
    //     throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    //   }
    // } else {
    //   throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    // }

    try {
      if (req.body.ownerId && !Number.isNaN(req.body.ownerId)) {
        if (req.file) {
          const { fileNanoId, metainfo } = createImageMetaInfo(req.file);

          let connectWith;
          try {
            connectWith = req?.body?.connectWith
              ? JSON.parse(req?.body?.connectWith)
              : {};
          } catch (err) {
            // nothing to be done ...
          }

          const image = await imageCreate(
            parseInt(req.body.ownerId, 10),
            fileNanoId,
            metainfo,
            "image",
            connectWith
          );

          res.json(image);
        } else {
          throw new ApiError(httpStatus.BAD_REQUEST, "Image upload failed #1");
        }
      } else {
        throw new ApiError(httpStatus.BAD_REQUEST, "Image upload failed #2");
      }
    } catch (err) {
      logger.error(err);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Image upload failed #3"
      );
    }
  } catch (err) {
    next(err);
  }
};

export const postProfileImage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // TODO: enable access restrictions
    // const refreshToken = req?.cookies?.refreshToken ?? "";
    // if (refreshToken) {
    //   try {
    //     const apiUserInRefreshToken = authAuthenticateUserByToken(refreshToken);
    //     if (apiUserInRefreshToken) {
    //       if (apiUserInRefreshToken.id !== parseInt(req.body.ownerId)) {
    //         throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    //       }
    //     }
    //   } catch (Err) {
    //     throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    //   }
    // } else {
    //   throw new ApiError(httpStatus.FORBIDDEN, "Access denied");
    // }

    try {
      if (req.body.ownerId && !Number.isNaN(req.body.ownerId)) {
        if (req.file) {
          const { fileNanoId, metainfo } = createImageMetaInfo(req.file);

          const image = await imageCreate(
            parseInt(req.body.ownerId, 10),
            fileNanoId,
            metainfo,
            "profile"
          );

          res.json(image);
        } else {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Profile image upload failed #1"
          );
        }
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Profile image upload failed #2"
        );
      }
    } catch (err) {
      logger.error(err);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Profile image upload failed #3"
      );
    }
  } catch (err) {
    next(err);
  }
};

export default postImage;
