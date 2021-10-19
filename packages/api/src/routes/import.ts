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
// import { authAuthenticateUserByToken } from "../services/serviceAuth";
import { dataImportParseInitialCsv } from "../services/serviceDataImport";
import {
  daoFileGetById,
  daoDataImportUpdate,
  daoDataImportGetById,
} from "../dao";
import { DataImportStatus } from "@culturemap/core";

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

export const postDataImportFileUpload = multer({ storage: storagePrivate });

export const postDataImportFile = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // const refreshToken = req?.cookies?.refreshToken ?? "";
    // TODO: enable access restrictions
    // TODO: bring to openar ...
    // logger.info(`RT 1 ${JSON.stringify(refreshToken)}`);
    // logger.info(`RT 1.1 ${JSON.stringify(req?.cookies)}`);
    // logger.info(`RT 1.2 ${JSON.stringify(req?.headers)}`);

    // if (refreshToken) {
    //   logger.info(`RT 2 ${refreshToken}`);
    //   try {
    //     const apiUserInRefreshToken = authAuthenticateUserByToken(refreshToken);
    //     logger.info(`RT 3 ${JSON.stringify(apiUserInRefreshToken)}`);
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
          let connectWith;
          try {
            connectWith = req?.body?.connectWith
              ? JSON.parse(req?.body?.connectWith)
              : {};
          } catch (err) {
            // nothing to be done ...
          }

          const importId = connectWith?.dataImports?.connect?.id;
          let importInDb;
          if (importId) importInDb = await daoDataImportGetById(importId);

          if (!importInDb)
            throw new ApiError(
              httpStatus.BAD_REQUEST,
              "DataImport file upload failed #1"
            );

          const { fileNanoId, metainfo } = createFileMetaInfo(req.file, true);
          const initialParseResult = await dataImportParseInitialCsv(
            importInDb?.type ?? "none",
            metainfo.originalFilePath,
            5,
            importInDb?.lang ?? "en"
          );

          if (initialParseResult.errors.length === 0) {
            const file = await fileCreate(
              parseInt(req.body.ownerId, 10),
              fileNanoId,
              metainfo,
              connectWith
            );

            if (file) {
              const fileInDb: any = await daoFileGetById(file.id, {
                dataImports: true,
              });

              if (
                fileInDb &&
                Array.isArray(fileInDb?.dataImports) &&
                fileInDb?.dataImports.length > 0
              ) {
                const ids = fileInDb?.dataImports.map((imp: any) => imp.id);

                if (ids && ids.length > 0)
                  await daoDataImportUpdate(ids[0], {
                    log: initialParseResult.log,
                    errors: initialParseResult.errors,
                    warnings: initialParseResult.warnings,
                    mapping: initialParseResult.mapping,
                    status: DataImportStatus.ASSIGN,
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
            "DataImport file upload failed #1"
          );
        }
      } else {
        throw new ApiError(
          httpStatus.BAD_REQUEST,
          "DataImport file upload failed #2"
        );
      }
    } catch (err) {
      logger.error(err);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "DataImport file upload failed #3"
      );
    }
  } catch (err: any) {
    next(err);
  }
};

export default postDataImportFile;
