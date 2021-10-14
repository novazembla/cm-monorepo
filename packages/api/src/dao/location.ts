import httpStatus from "http-status";
import { Location, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedCheckSlugUnique,
  daoSharedGenerateFullText,
  daoSharedWrapImageWithTranslationImage,
  daoImageTranslatedColumns,
  daoSharedMapTranslatedColumnsToJson,
  daoSharedMapJsonToTranslatedColumns,
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
  // xxx fix
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
    daoSharedMapTranslatedColumnsToJson(
      locations,
      daoLocationTranslatedColumns
    ),
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
      title: true,
      slug: true,
      description: true,
      lat: true,
      lng: true,
    },
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    daoSharedMapTranslatedColumnsToJson(
      locations,
      daoLocationTranslatedColumns
    ),
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
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      daoSharedMapTranslatedColumnsToJson(
        location,
        daoLocationTranslatedColumns
      ),
      daoImageTranslatedColumns
    ),
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
    data.slug as Record<string, string>
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const location: Location = await prisma.location.create({
    data: daoSharedMapJsonToTranslatedColumns(
      {
        ...data,
        fullText: daoSharedGenerateFullText(data, daoLocationFullTextKeys),
      },
      daoLocationTranslatedColumns
    ),
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedMapTranslatedColumnsToJson(location, daoLocationTranslatedColumns),
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
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      daoSharedMapTranslatedColumnsToJson(
        location,
        daoLocationTranslatedColumns
      ),
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.location
  );
};

export const daoLocationUpdate = async (
  id: number,
  data: Prisma.LocationUpdateInput
): Promise<Location> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.location.findMany,
    data.slug as Record<string, string>,
    true,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const location: Location = await prisma.location.update({
    data: daoSharedMapJsonToTranslatedColumns(
      {
        ...data,
        fullText: daoSharedGenerateFullText(data, daoLocationFullTextKeys),
      },
      daoLocationTranslatedColumns
    ),
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedMapTranslatedColumnsToJson(
      daoSharedMapTranslatedColumnsToJson(
        location,
        daoLocationTranslatedColumns
      ),
      daoLocationTranslatedColumns
    ),
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
    daoSharedMapTranslatedColumnsToJson(
      daoSharedMapTranslatedColumnsToJson(
        location,
        daoLocationTranslatedColumns
      ),
      daoLocationTranslatedColumns
    ),
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
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      daoSharedMapTranslatedColumnsToJson(
        location,
        daoLocationTranslatedColumns
      ),
      daoImageTranslatedColumns
    ),
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
