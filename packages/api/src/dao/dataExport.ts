import { DataExport, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoDataExportQuery = async (
  where: Prisma.DataExportWhereInput,
  include: Prisma.DataExportInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<DataExport[]> => {
  const dataExports: DataExport[] = await prisma.dataExport.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    dataExports,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataExportQueryFirst = async (
  where: Prisma.DataExportWhereInput,
  include: Prisma.DataExportInclude | undefined
): Promise<DataExport> => {
  const dataExportInDb = await prisma.dataExport.findFirst({
    where,
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    dataExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataExportQueryCount = async (
  where: Prisma.DataExportWhereInput
): Promise<number> => {
  console.log(
    await prisma.dataExport.findMany({
      take: 100,
      skip: 0,
      select: {
        id: true,
        title: true,
        lang: true,
        type: true,
        log: true,
        errors: true,
        meta: true,
        status: true,
        fileId: true,
        file: true,
        ownerId: true,
        owner: true,
        createdAt: true,
        updatedAt: true,
      },
    })
  );

  return prisma.dataExport.count({
    where,
  });
};

export const daoDataExportCreate = async (
  data: Prisma.DataExportCreateInput
): Promise<DataExport> => {
  const dataExportInDb: DataExport = await prisma.dataExport.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    dataExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataExportGetById = async (
  id: number,
  include?: Prisma.DataExportInclude | undefined
): Promise<DataExport> => {
  const dataExportInDb: DataExport | null = await prisma.dataExport.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    dataExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataExportUpdate = async (
  id: number,
  data: Prisma.DataExportUpdateInput
): Promise<DataExport> => {
  const dataExportInDb: DataExport = await prisma.dataExport.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    dataExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataExportGetStatusById = async (
  id: number
): Promise<DataExport> => {
  const dataExportInDb = await prisma.dataExport.findUnique({
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
    dataExportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataExportDelete = async (id: number): Promise<DataExport> => {
  const term: DataExport = await prisma.dataExport.delete({
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
  daoDataExportQuery,
  daoDataExportQueryFirst,
  daoDataExportQueryCount,
  daoDataExportGetById,
  daoDataExportCreate,
  daoDataExportUpdate,
  daoDataExportDelete,
  daoDataExportGetStatusById,
};
export default defaults;
