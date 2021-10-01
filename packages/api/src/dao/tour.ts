import httpStatus from "http-status";
import { Tour, TourStop, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoTourStopGetTourStopsByTourId,
  daoTourStopGetTourStopsCountByTourId,
} from "./tourStop";
import {
  daoSharedCheckSlugUnique,
  daoSharedGenerateFullText,
  daoSharedWrapImageWithTranslationImage,
  daoImageTranslatedColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

const fullTextKeys = [
  "title",
  "slug",
  "duration",
  "distance",
  "teaser",
  "description",
];

export const daoTourCheckSlugUnique = async (
  slug: Record<string, string>,
  id?: number,
  uniqueInObject?: boolean
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.tour.findMany,
    slug,
    id,
    uniqueInObject
  );
};

export const daoTourQuery = async (
  where: Prisma.TourWhereInput,
  include: Prisma.TourInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Tour[]> => {
  const tours = await prisma.tour.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    tours,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourQueryFirst = async (
  where: Prisma.TourWhereInput,
  include?: Prisma.TourInclude | undefined,
  orderBy?: any,
  pageIndex?: number,
  pageSize?: number
): Promise<Tour> => {
  const tour = await prisma.tour.findFirst({
    where,
    include,
    orderBy,
    skip: (pageIndex ?? 0) * (pageSize ?? apiConfig.db.defaultPageSize),
    take: Math.min(
      pageSize ?? apiConfig.db.defaultPageSize,
      apiConfig.db.maxPageSize
    ),
  });

  return filteredOutputByBlacklistOrNotFound(
    // HOW to generalize that to work with many images...
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tour,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourQueryCount = async (
  where: Prisma.TourWhereInput
): Promise<number> => {
  return prisma.tour.count({
    where,
  });
};

export const daoTourGetTourStops = async (id: number): Promise<TourStop[]> => {
  return daoTourStopGetTourStopsByTourId(id);
};

export const daoTourGetById = async (id: number): Promise<Tour> => {
  const tour: Tour | null = await prisma.tour.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tour,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourCreate = async (
  data: Prisma.TourCreateInput
): Promise<Tour> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.tour.findMany,
    data.slug as Record<string, string>
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const tour: Tour = await prisma.tour.create({
    data: {
      ...data,
      fullText: daoSharedGenerateFullText(data, fullTextKeys),
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    tour,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourUpdate = async (
  id: number,
  data: Prisma.TourUpdateInput
): Promise<Tour> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.tour.findMany,
    data.slug as Record<string, string>,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const tour: Tour = await prisma.tour.update({
    data: {
      ...data,
      fullText: daoSharedGenerateFullText(data, fullTextKeys),
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      tour,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.tour
  );
};

export const daoTourDelete = async (id: number): Promise<Tour> => {
  const termCount = await daoTourStopGetTourStopsCountByTourId(id);
  if (termCount > 0)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You cannot delete the tour as it still has ${termCount} terms`
    );

  const tour: Tour = await prisma.tour.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    tour,
    apiConfig.db.privateJSONDataKeys.tour
  );
};

const defaults = {
  daoTourQuery,
  daoTourQueryFirst,
  daoTourQueryCount,
  daoTourGetById,
  daoTourCheckSlugUnique,
  daoTourCreate,
  daoTourUpdate,
  daoTourDelete,
};
export default defaults;
