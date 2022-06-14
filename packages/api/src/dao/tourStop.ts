import httpStatus from "http-status";
import { TourStop, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedGenerateFullText,
  daoSharedMapJsonToTranslatedColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoTourStopFullTextKeys = [
  "title",
  "description",
  "metaDesc",
  "teaser",
];

export const daoTourStopTranslatedColumns = [
  "title",
  "description",
  "metaDesc",
  "teaser",
];

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

export const daoTourStopForceReorder = async (
  tourStopId: number
): Promise<number> => {
  let tourStopInDb = await prisma.tourStop.findFirst({
    where: { id: tourStopId },
    select: { tour: true },
  });

  if (!tourStopInDb?.tour?.id) return 0;

  const tourStops = await prisma.tourStop.findMany({
    where: {
      tour: {
        id: tourStopInDb?.tour?.id,
      },
    },
    orderBy: {
      number: "asc",
    },
  });

  if (tourStops) {
    const promises = await prisma.$transaction(
      tourStops.map((tS: any, index: number) => {
        return prisma.tourStop.update({
          data: {
            number: index + 1,
          },
          where: {
            id: tS.id,
          },
        });
      })
    );
    return promises?.length;
  }

  return 0;
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
    tourStop,
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
    tourStop,
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

  await daoTourStopForceReorder(tourStop.id);

  return filteredOutputByBlacklistOrNotFound(
    tourStop,
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

  await daoTourStopForceReorder(id);

  return filteredOutputByBlacklistOrNotFound(
    tourStop,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopDelete = async (id: number): Promise<TourStop> => {
  let tourStopInDb = await prisma.tourStop.findFirst({
    where: { id },
    select: { tour: true },
  });

  if (!tourStopInDb)
    throw new ApiError(httpStatus.BAD_REQUEST, `Tour stop not found`);

  const tourStop = await prisma.tourStop.delete({
    where: {
      id,
    },
    select: {
      tour: true,
    },
  });

  await daoTourStopForceReorder(id);

  return filteredOutputByBlacklistOrNotFound(
    tourStop,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourStopChangeOwner = async (
  oldOwnerId: number,
  newOwnerId: number
): Promise<number> => {
  const result = await prisma.tourStop.updateMany({
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
  daoTourStopChangeOwner,
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
