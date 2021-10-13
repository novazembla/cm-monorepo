import { Request, Response, NextFunction } from "express";
import httpStatus from "http-status";
import path from "path";
import multer from "multer";
import { nanoid } from "nanoid";
import { unlink } from "fs/promises";
import { logger } from "../services/serviceLogging";
import { fileCreate, fileGetUploadInfo } from "../services/serviceFile";

import { createFileMetaInfo } from ".";

import { ApiError } from "../utils";
import { authAuthenticateUserByToken } from "../services/serviceAuth";
import { importParseInitialCsv } from "../services/serviceImport";
import { daoFileGetById, daoImportUpdate } from "../dao";
import { ImportStatus } from "@culturemap/core";

const storagePrivate = multer.diskStorage({
  destination: async (_req: Request, _file, cb) => {
    let uploadInfo: any;
    try {
      uploadInfo = await fileGetUploadInfo(true);
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

export const postImportFileUpload = multer({ storage: storagePrivate });

export const postImportFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refreshToken = req?.cookies?.refreshToken ?? "";
    // TODO: remove
    logger.info(`RT 1 ${JSON.stringify(refreshToken)}`);
    logger.info(`RT 1.1 ${JSON.stringify(req?.cookies)}`);
    logger.info(`RT 1.2 ${JSON.stringify(req?.headers)}`);

    if (refreshToken) {
      logger.info(`RT 2 ${refreshToken}`);
      try {
        const apiUserInRefreshToken = authAuthenticateUserByToken(refreshToken);
        logger.info(`RT 3 ${JSON.stringify(apiUserInRefreshToken)}`);
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
          const { fileNanoId, metainfo } = createFileMetaInfo(req.file, true);

          const initialParseResult = await importParseInitialCsv(
            metainfo.originalFilePath,
            10
          );

          if (initialParseResult.errors.length === 0) {
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

            if (file) {
              const fileInDb: any = await daoFileGetById(file.id, {
                imports: true,
              });

              if (
                fileInDb &&
                Array.isArray(fileInDb?.imports) &&
                fileInDb?.imports.length > 0
              ) {
                const ids = fileInDb?.imports.map((imp: any) => imp.id);

                if (ids && ids.length > 0)
                  await daoImportUpdate(ids[0], {
                    log: initialParseResult.log,
                    errors: initialParseResult.errors,
                    warnings: initialParseResult.warnings,
                    mapping: initialParseResult.mapping,
                    status: ImportStatus.ASSIGN,
                  });
              }
            }

            res.json({
              file,
              initialParseResult,
            });
          } else {
            await unlink(metainfo.originalFilePath);
            res.json({
              file: null,
              initialParseResult,
            });
          }
        } else {
          throw new ApiError(
            httpStatus.BAD_REQUEST,
            "Import file upload failed #1"
          );
        }
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "Import file upload failed #2"
        );
      }
    } catch (err) {
      logger.error(err);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Import file upload failed #3"
      );
    }
  } catch (err: any) {
    next(err);
  }
};

export default postImportFile;
