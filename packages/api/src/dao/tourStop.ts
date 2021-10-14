import { TourStop, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedGenerateFullText,
  daoSharedWrapImageWithTranslationImage,
  daoImageTranslatedColumns,
  daoSharedMapJsonToTranslatedColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoTourStopFullTextKeys = ["title", "description", "teaser"];

export const daoTourStopTranslatedColumns = ["title", "description", "teaser"];

export const daoTourStopReorder = async (
  id: number,
  data: any
): Promise<number> => {
  const promises = await prisma.$transaction(
    data.map((tS: any) => {
      return prisma.tourStop.update({
        data: {
          number: tS.number,
        },
        where: {
          id: tS.id,
        },
      });
    })
  );

  return promises.length;
};

export const daoTourStopsQuery = async (
  tourId: number,
  where: Prisma.TourStopWhereInput,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<TourStop[]> => {
  const tourStops: TourStop[] = await prisma.tourStop.findMany({
    where: {
      ...where,
      tourId,
    },
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    tourStops,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopQuery = async (
  where: Prisma.TourStopWhereInput,
  include?: Prisma.TourStopInclude
): Promise<TourStop> => {
  const tourStop = await prisma.tourStop.findFirst({
    where: {
      ...where,
    },
    include,
  });

  return filteredOutputByBlacklist(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tourStop,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopQueryCount = async (
  where: Prisma.TourStopWhereInput
): Promise<number> => {
  return prisma.tourStop.count({
    where,
  });
};

export const daoTourStopsCountQuery = async (
  tourId: number,
  where: Prisma.TourStopWhereInput
): Promise<number> => {
  return prisma.tourStop.count({
    where: {
      ...where,
      tourId,
    },
  });
};

export const daoTourStopGetTourStopsByTourId = async (
  tourId: number
): Promise<TourStop[]> => {
  const tourStops: TourStop[] = await prisma.tourStop.findMany({
    where: {
      tourId,
    },
  });

  return filteredOutputByBlacklist(
    tourStops,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopGetTourStopsCountByTourId = async (
  tourId: number
): Promise<number> => {
  const count = await prisma.tourStop.count({
    where: {
      tourId,
    },
  });

  return count;
};

export const daoTourStopGetById = async (id: number): Promise<TourStop> => {
  const tourStop: TourStop | null = await prisma.tourStop.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tourStop,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopCreate = async (
  data: Prisma.TourStopCreateInput
): Promise<TourStop> => {
  let dbData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoTourStopTranslatedColumns
  );

  let tourStop: TourStop = await prisma.tourStop.create({
    data: {
      ...dbData,
      fullText: daoSharedGenerateFullText(
        dbData,
        daoTourStopFullTextKeys,
        daoTourStopTranslatedColumns
      ),
    },
  });

  const count = await prisma.tourStop.count({
    where: {
      tourId: tourStop.tourId,
    },
  });

  if (count > 1) {
    tourStop = await prisma.tourStop.update({
      data: {
        number: count,
      },
      where: {
        id: tourStop.id,
      },
    });
  }

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tourStop,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopUpdate = async (
  id: number,
  data: Prisma.TourStopUpdateInput
): Promise<TourStop> => {
  let dbData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoTourStopTranslatedColumns
  );

  const tourStop: TourStop = await prisma.tourStop.update({
    data: {
      ...dbData,
      fullText: daoSharedGenerateFullText(
        dbData,
        daoTourStopFullTextKeys,
        daoTourStopTranslatedColumns
      ),
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tourStop,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopDelete = async (id: number): Promise<TourStop> => {
  const tourStop: TourStop = await prisma.tourStop.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    tourStop,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

const defaults = {
  daoTourStopsQuery,
  daoTourStopsCountQuery,
  daoTourStopGetById,
  daoTourStopGetTourStopsByTourId,
  daoTourStopGetTourStopsCountByTourId,
  daoTourStopCreate,
  daoTourStopUpdate,
  daoTourStopDelete,
  daoTourStopReorder,
};

export default defaults;
