import { Request, Response } from "express";
import httpStatus from "http-status";
import path from "path";
import multer from "multer";
import { mkdirSync } from "fs";
import uuid from "uuid";

import { logger } from "../services/serviceLogging";
import { imageCreate } from "../services/serviceImage";
import { ImageMetaInformation } from "../dao";

import config from "../config";
import { ApiError } from "../utils";

const { v4: uuidv4 } = uuid;

const storage = multer.diskStorage({
  destination: async (req: Request, file, cb) => {
    const date = new Date();

    const uploadFolder = `${config.uploadDir}/${date.getUTCFullYear()}/${
      date.getUTCMonth() + 1
    }`;
    const uploadPath = `${config.baseDir}/${config.publicDir}/${uploadFolder}`;

    try {
      // TODO: how to make this non blocking?
      mkdirSync(uploadPath, { recursive: true });
    } catch (e) {
      logger.error(e);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "[image] upload failed #1"
      );
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, `${uuidv4()}${extension}`);
  },
});

export const postImageUpload = multer({ storage });

const createImageMetaInfo = (
  file: Express.Multer.File
): {
  fileUuid: string;
  metainfo: ImageMetaInformation;
} => {
  const extension = path.extname(file.originalname);

  const uploadFolder = file.destination.replace(
    `${config.baseDir}/${config.publicDir}`,
    ""
  );

  const fileUuid = file.filename.replace(extension, "");

  const metainfo: ImageMetaInformation = {
    uploadFolder,
    originalFileName: file.originalname,
    originalFileUrl: `${config.baseUrl.api}/${uploadFolder}/${file.filename}`,
    originalFilePath: file.path,
    mimeType: file.mimetype,
    encoding: file.encoding,
    imageType: "square",
    size: file.size,
  };

  return { fileUuid, metainfo };
};

export const postImage = async (req: Request, res: Response) => {
  // TODO: access protection
  // TODO: howto trigger refresh?
  // Maybe autosend auth token

  try {
    if (req.body.ownerId && !Number.isNaN(req.body.ownerId)) {
      if (req.file) {
        const { fileUuid, metainfo } = createImageMetaInfo(req.file);

        const image = await imageCreate(
          parseInt(req.body.ownerId, 10),
          fileUuid,
          metainfo,
          "image"
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
};

export const postProfileImage = async (req: Request, res: Response) => {
  // TODO: access protection
  // TODO: howto trigger refresh?
  // Maybe autosend auth token

  try {
    if (req.body.ownerId && !Number.isNaN(req.body.ownerId)) {
      if (req.file) {
        const { fileUuid, metainfo } = createImageMetaInfo(req.file);

        const image = await imageCreate(
          parseInt(req.body.ownerId, 10),
          fileUuid,
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
};

export default postImage;
