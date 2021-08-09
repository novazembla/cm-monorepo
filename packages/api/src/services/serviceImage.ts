import { Image } from "@prisma/client";
import httpStatus from "http-status";
import { mkdir } from "fs/promises";
import uuid from "uuid";

import { ApiError } from "../utils";
import config from "../config";
import { daoImageCreate } from "../dao";
import { logger } from "./serviceLogging";

const { v4: uuidv4 } = uuid;

// TODO: use https://github.com/image-size/image-size;

export type ImageMetaInformation = {
  uploadFolder: string;
  originalFileName: string;
  originalFileUrl: string;
  originalFilePath: string;
  mimeType: any;
  encoding: any;
};

export const imageGetUploadInfo = async (): Promise<{
  path: string;
  uuid: string;
  baseUrl: string;
  uploadFolder: string;
}> => {
  const date = new Date();

  const uploadFolder = `${config.uploadDir}/${date.getUTCFullYear()}/${
    date.getUTCMonth() + 1
  }`;
  const path = `${config.baseDir}/${config.publicDir}/${uploadFolder}`;
  const baseUrl = `${config.baseUrl.api}/${uploadFolder}`;

  try {
    await mkdir(path, { recursive: true });
  } catch (e) {
    logger.error(e);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "[image] upload failed #1"
    );
  }

  return { path, uuid: uuidv4(), baseUrl, uploadFolder };
};

export const imageCreate = async (
  ownerId: number,
  imageUuid: string,
  meta: ImageMetaInformation,
  type: "image" | "profile" = "image"
): Promise<Image> => {
  const image: Image = await daoImageCreate({
    owner: {
      connect: {
        id: ownerId,
      },
    },
    thumbUrl: "",
    uuid: imageUuid,
    meta,
    type,
    status: "uploaded",
  });

  if (!image)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "New profile image could not be created"
    );

  // TODO: xxx schedule resizing tasks.

  return image;
};

// export const imageUpdate = async (
//   scope: string,
//   id: number,
//   data: Prisma.ImageUpdateInput
// ): Promise<Image> => {
//   const imageInDb = await daoImageGetById(id);

//   let newEmailAddress = false;
//   let dbData = data;

//   if (data.email && data.email !== imageInDb.email) {
//     newEmailAddress = true;
//     dbData = {
//       ...dbData,
//       emailVerified: false,
//     };
//     if (await daoImageCheckIsEmailTaken(data.email as string, id))
//       throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
//   }

//   const image: Image = await daoImageUpdate(id, dbData);

//   if (image.imageBanned)
//     await daoTokenDeleteMany({
//       imageId: id,
//     });

//   if (newEmailAddress)
//     await authSendEmailConfirmationEmail(
//       scope as AppScopes,
//       image.id,
//       image.email
//     );

//   return image;
// };

export default {
  imageGetUploadInfo,
  imageCreate,
  // imageUpdate,
  // imageRead,
};
