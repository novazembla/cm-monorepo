import { Image, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist, ImageStatus } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";

import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoImageQuery = async (
  where: Prisma.ImageWhereInput,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Image[]> => {
  const images: Image[] = await prisma.image.findMany({
    where,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    images,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageQueryCount = async (
  where: Prisma.ImageWhereInput
): Promise<number> => {
  return prisma.image.count({
    where,
  });
};

export const daoImageGetById = async (id: number): Promise<Image> => {
  const image: Image | null = await prisma.image.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    image,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageGetStatusById = async (id: number): Promise<Image> => {
  const image = await prisma.image.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      meta: true,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    image,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageCreate = async (
  data: Prisma.ImageCreateInput
): Promise<Image> => {
  const image: Image = await prisma.image.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    image,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageUpdate = async (
  id: number,
  data: Prisma.ImageUpdateInput
): Promise<Image> => {
  const image: Image = await prisma.image.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    image,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageDelete = async (id: number): Promise<Image> => {
  const image: Image = await prisma.image.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    image,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageSetToDelete = async (id: number): Promise<Image> => {
  const image: Image = await prisma.image.update({
    data: {
      status: ImageStatus.DELETED,
      events: {
        set: [],
      },
      tourStops: {
        set: [],
      },
      locations: {
        set: [],
      },
      profileImageUsers: {
        set: [],
      },
      heroImagePages: {
        set: [],
      },
      heroImageEvents: {
        set: [],
      },
      heroImageTours: {
        set: [],
      },
      heroImageTourStops: {
        set: [],
      },
      heroImageLocations: {
        set: [],
      },
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    image,
    apiConfig.db.privateJSONDataKeys.image
  );
};

export const daoImageChangeOwner = async (
  oldOwnerId: number,
  newOwnerId: number
): Promise<number> => {
  const result = await prisma.image.updateMany({
    data: {
      ownerId: newOwnerId,
    },

    where: {
      ownerId: oldOwnerId,
    },
  });

  return result.count;
};

const defaults = {
  daoImageChangeOwner,
  daoImageQuery,
  daoImageQueryCount,
  daoImageGetById,
  daoImageCreate,
  daoImageUpdate,
  daoImageDelete,
  daoImageSetToDelete,
  daoImageGetStatusById,
};

export default defaults;
