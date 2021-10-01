import { Image, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist, ImageStatusEnum } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";

import { getPrismaClient } from "../db/client";

import { daoSharedMapTranslations } from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoImageTranslatedColumns = ["alt", "credits"];

export const daoImageQuery = async (
  where: Prisma.ImageWhereInput,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Image[]> => {
  const images: Image[] = await prisma.image.findMany({
    where,
    orderBy,
    include: {
      translations: true,
    },
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    daoSharedMapTranslations(images, daoImageTranslatedColumns),
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
      status: ImageStatusEnum.DELETED,
      events: {
        set: [],
      },
      // tours TODO: ...
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

export const daoImageSaveImageTranslations = async (
  translations: any
): Promise<number> => {
  if (!Array.isArray(translations) || translations.length === 0) return 0;

  const totals: any[] = await prisma.$transaction(
    translations.map((imageTranslation) =>
      prisma.image.update({
        data: {
          translations: {
            upsert: Object.keys(imageTranslation.translations).reduce(
              (upserts: any[], key: any) => {
                return [
                  ...upserts,
                  ...Object.keys(imageTranslation.translations[key]).map(
                    (lang: any) => {
                      return {
                        create: {
                          lang: lang,
                          key: key,
                          translation: imageTranslation.translations[key][lang],
                        },
                        update: {
                          translation: imageTranslation.translations[key][lang],
                        },
                        where: {
                          uniqueTransKeys: {
                            lang: lang,
                            key: key,
                            imageId: imageTranslation.id,
                          },
                        },
                      };
                    }
                  ),
                ];
              },
              []
            ),
          },
        },
        where: { id: imageTranslation.id },
      })
    )
  );

  return totals.reduce((acc, total) => acc + total, 0);
};

const defaults = {
  daoImageQuery,
  daoImageQueryCount,
  daoImageGetById,
  daoImageCreate,
  daoImageUpdate,
  daoImageDelete,
  daoImageSetToDelete,
  daoImageGetStatusById,
  daoImageTranslatedColumns,
  daoImageSaveImageTranslations,
};

export default defaults;
