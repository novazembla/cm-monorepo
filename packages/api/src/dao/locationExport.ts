import { LocationExport, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedWrapImageWithTranslationImage,
  daoImageTranslatedColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoLocationExportQuery = async (
  where: Prisma.LocationExportWhereInput,
  include: Prisma.LocationExportInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<LocationExport[]> => {
  const locationExports: LocationExport[] =
    await prisma.locationExport.findMany({
      where,
      include,
      orderBy,
      skip: pageIndex * pageSize,
      take: Math.min(pageSize, apiConfig.db.maxPageSize),
    });

  return filteredOutputByBlacklist(
    locationExports,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoLocationExportQueryFirst = async (
  where: Prisma.LocationExportWhereInput,
  include: Prisma.LocationExportInclude | undefined
): Promise<LocationExport> => {
  const locationExportInDb = await prisma.locationExport.findFirst({
    where,
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      locationExportInDb,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoLocationExportQueryCount = async (
  where: Prisma.LocationExportWhereInput
): Promise<number> => {
  return prisma.locationExport.count({
    where,
  });
};

export const daoLocationExportCreate = async (
  data: Prisma.LocationExportCreateInput
): Promise<LocationExport> => {
  const locationExportInDb: LocationExport = await prisma.locationExport.create(
    {
      data,
    }
  );

  return filteredOutputByBlacklistOrNotFound(
    locationExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoLocationExportGetById = async (
  id: number,
  include?: Prisma.LocationExportInclude | undefined
): Promise<LocationExport> => {
  const locationExportInDb: LocationExport | null =
    await prisma.locationExport.findUnique({
      where: { id },
      include,
    });

  return filteredOutputByBlacklistOrNotFound(
    daoSharedWrapImageWithTranslationImage(
      "heroImage",
      locationExportInDb,
      daoImageTranslatedColumns
    ),
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoLocationExportUpdate = async (
  id: number,
  data: Prisma.LocationExportUpdateInput
): Promise<LocationExport> => {
  const locationExportInDb: LocationExport = await prisma.locationExport.update(
    {
      data,
      where: {
        id,
      },
    }
  );

  return filteredOutputByBlacklistOrNotFound(
    locationExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoLocationExportGetStatusById = async (
  id: number
): Promise<LocationExport> => {
  const locationExportInDb = await prisma.locationExport.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      meta: true,
      log: true,
      errors: true,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    locationExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoLocationExportDelete = async (
  id: number
): Promise<LocationExport> => {
  const term: LocationExport = await prisma.locationExport.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    apiConfig.db.privateJSONDataKeys.all
  );
};

const defaults = {
  daoLocationExportQuery,
  daoLocationExportQueryFirst,
  daoLocationExportQueryCount,
  daoLocationExportGetById,
  daoLocationExportCreate,
  daoLocationExportUpdate,
  daoLocationExportDelete,
  daoLocationExportGetStatusById,
};
export default defaults;
