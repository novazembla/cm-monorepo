import { File } from "@prisma/client";
import httpStatus from "http-status";
import { mkdir } from "fs/promises";
import type { ApiFileMetaInformation } from "@culturemap/core";
import { FileStatus } from "@culturemap/core";
import { ApiError } from "../utils";
import { getApiConfig } from "../config";
import { nanoid } from "nanoid";
import { daoFileCreate } from "../dao";
import { logger } from "./serviceLogging";

export const fileGetUploadInfo = async (): Promise<{
  path: string;
  nanoid: string;
  baseUrl: string;
  uploadFolder: string;
}> => {
  const apiConfig = getApiConfig();

  const uploadFolder = `csv/`;
  const path =
    `${apiConfig.baseDir}/${apiConfig.importDir}/${uploadFolder}`.replace(
      /\/\//g,
      "/"
    );
  const baseUrl = `${apiConfig.baseUrl.api}${uploadFolder}`;

  try {
    await mkdir(path, { recursive: true });
  } catch (e) {
    logger.error(e);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "[file] upload failed #1"
    );
  }

  return { path, nanoid: nanoid(), baseUrl, uploadFolder };
};

export const fileCreate = async (
  ownerId: number,
  fileNanoId: string,
  meta: ApiFileMetaInformation,
  connectWith?: any
): Promise<File> => {
  const file: File = await daoFileCreate({
    owner: {
      connect: {
        id: ownerId,
      },
    },

    nanoid: fileNanoId,
    meta,
    status: FileStatus.UPLOADED,
    ...connectWith,
  });

  if (!file)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "New file could not be created"
    );

  return file;
};

const defaults = {
  fileGetUploadInfo,
  fileCreate,
};
export default defaults;
