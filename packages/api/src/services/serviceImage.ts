import { Image } from "@prisma/client";
import httpStatus from "http-status";
import { mkdir } from "fs/promises";
import type { ApiImageMetaInformation } from "@culturemap/core";
import { ImageStatus } from "@culturemap/core";
import { ApiError } from "../utils";
import { getApiConfig } from "../config";
import { nanoid } from "nanoid";
import { daoImageCreate } from "../dao";
import { logger } from "./serviceLogging";

export const imageGetUploadInfo = async (): Promise<{
  path: string;
  nanoid: string;
  baseUrl: string;
  uploadFolder: string;
}> => {
  const apiConfig = getApiConfig();

  const date = new Date();

  const uploadFolder = `${apiConfig.uploadDir}/${date.getUTCFullYear()}/${
    date.getUTCMonth() + 1
  }`;
  const path =
    `${apiConfig.baseDir}/${apiConfig.publicDir}/${uploadFolder}`.replace(
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
      "[image] upload failed #1"
    );
  }

  return { path, nanoid: nanoid(), baseUrl, uploadFolder };
};

export const imageCreate = async (
  ownerId: number,
  imageNanoId: string,
  meta: ApiImageMetaInformation,
  type: "image" | "profile" = "image",
  connectWith?: any
): Promise<Image> => {
  const image: Image = await daoImageCreate({
    owner: {
      connect: {
        id: ownerId,
      },
    },

    nanoid: imageNanoId,
    meta,
    type,
    status: ImageStatus.UPLOADED,
    ...connectWith,
    ...(type === "profile"
      ? {
          profileImageUsers: {
            connect: {
              id: ownerId,
            },
          },
        }
      : {}),
  });

  if (!image)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "New profile image could not be created"
    );

  return image;
};

const defaults = {
  imageGetUploadInfo,
  imageCreate,
};
export default defaults;
