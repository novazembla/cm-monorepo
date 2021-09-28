import { Image } from "@prisma/client";
import httpStatus from "http-status";
import { mkdir } from "fs/promises";
import type { ApiImageMetaInformation } from "@culturemap/core";
import { ImageStatusEnum } from "@culturemap/core";
import { ApiError } from "../utils";
import { getApiConfig } from "../config";
import { nanoid } from "nanoid";
import { daoImageCreate } from "../dao";
import { logger } from "./serviceLogging";

const apiConfig = getApiConfig();

export const imageGetUploadInfo = async (): Promise<{
  path: string;
  nanoid: string;
  baseUrl: string;
  uploadFolder: string;
}> => {
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
    status: ImageStatusEnum.UPLOADED,
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
