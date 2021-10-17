import httpStatus from "http-status";
import { Location, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedCheckSlugUnique,
  daoSharedGenerateFullText,
  daoSharedMapJsonToTranslatedColumns,
  daoSharedGetTranslatedSelectColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoLocationFullTextKeys = [
  "title",
  "slug",
  "description",
  "offers",
  "accessibilityInformation",
];

export const daoLocationTranslatedColumns = [
  "title",
  "slug",
  "description",
  "offers",
  "accessibilityInformation",
];

export const daoLocationCheckSlugUnique = async (
  slug: Record<string, string>,
  uniqueInObject: boolean,
  id?: number
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.location.findMany,
    slug,
    uniqueInObject,
    id
  );
};

export const daoLocationQuery = async (
  where: Prisma.LocationWhereInput,
  include: Prisma.LocationInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Location[]> => {
  const locations: Location[] = await prisma.location.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    locations,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationSearchQuery = async (
  where: Prisma.LocationWhereInput,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize * 3
): Promise<Location[]> => {
  const locations = await prisma.location.findMany({
    where,
    select: {
      id: true,
      ...daoSharedGetTranslatedSelectColumns(["title", "slug", "description"]),
      lat: true,
      lng: true,
    },
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    locations,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationQueryFirst = async (
  where: Prisma.LocationWhereInput,
  include: Prisma.LocationInclude | undefined
): Promise<Location> => {
  const location = await prisma.location.findFirst({
    where,
    include,
  });
  return filteredOutputByBlacklistOrNotFound(
    location,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationQueryCount = async (
  where: Prisma.LocationWhereInput
): Promise<number> => {
  return prisma.location.count({
    where,
  });
};

export const daoLocationCreate = async (
  data: Prisma.LocationCreateInput
): Promise<Location> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.location.findMany,
    (data as any).slug
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let createData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoLocationTranslatedColumns
  );

  const location: Location = await prisma.location.create({
    data: {
      ...createData,
      fullText: daoSharedGenerateFullText(
        createData,
        daoLocationFullTextKeys,
        daoLocationTranslatedColumns
      ),
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    location,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationGetById = async (
  id: number,
  include?: Prisma.LocationInclude | undefined
): Promise<Location> => {
  const location: Location | null = await prisma.location.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    location,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationUpdate = async (
  id: number,
  data: Prisma.LocationUpdateInput
): Promise<Location> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.location.findMany,
    (data as any).slug,
    true,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let updateData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoLocationTranslatedColumns
  );

  const location: Location = await prisma.location.update({
    data: {
      ...updateData,
      fullText: daoSharedGenerateFullText(
        updateData,
        daoLocationFullTextKeys,
        daoLocationTranslatedColumns
      ),
    },

    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    location,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationDelete = async (id: number): Promise<Location> => {
  const location: Location = await prisma.location.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    location,
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationGetBySlug = async (
  slug: string,
  include?: Prisma.LocationInclude | undefined
): Promise<Location> => {
  const config = getApiConfig();

  const location = await prisma.location.findFirst({
    where: {
      OR: config?.activeLanguages.map((lang) => ({
        [`slug_${lang}`]: slug,
      })),
    },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    location,
    apiConfig.db.privateJSONDataKeys.location
  );
};

const defaults = {
  daoLocationQuery,
  daoLocationQueryFirst,
  daoLocationQueryCount,
  daoLocationGetById,
  daoLocationCheckSlugUnique,
  daoLocationCreate,
  daoLocationUpdate,
  daoLocationDelete,
  daoLocationSearchQuery,
  daoLocationGetBySlug,
};

export default defaults;
