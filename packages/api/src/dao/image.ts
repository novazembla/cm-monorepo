import { Image, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist, ImageStatusEnum } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";

import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export const daoImageQuery = async (
  where: Prisma.ImageWhereInput,
  orderBy: Prisma.ImageOrderByInput | Prisma.ImageOrderByInput[],
  pageIndex: number = 0,
  pageSize: number = config.db.defaultPageSize
): Promise<Image[]> => {
  const images: Image[] = await prisma.image.findMany({
    where,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, config.db.maxPageSize),
  });

  return filteredOutputByBlacklist(images, config.db.privateJSONDataKeys.image);
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
    config.db.privateJSONDataKeys.image
  );
};

export const daoImageGetStatusById = async (
  id: number
): Promise<ImageStatusEnum> => {
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
    config.db.privateJSONDataKeys.image
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
    config.db.privateJSONDataKeys.image
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
    config.db.privateJSONDataKeys.image
  );
};

export const daoImageDelete = async (id: number): Promise<Image> => {
  const image: Image = await prisma.image.delete({
    where: {
      id,
    },
  });

  // TODO: schedule task to wipe file off the disk
  return filteredOutputByBlacklistOrNotFound(
    image,
    config.db.privateJSONDataKeys.image
  );
};

export default {
  daoImageQuery,
  daoImageQueryCount,
  daoImageGetById,
  daoImageCreate,
  daoImageUpdate,
  daoImageDelete,
  daoImageGetStatusById,
};
