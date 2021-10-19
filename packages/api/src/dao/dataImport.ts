import { DataImport, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoDataImportQuery = async (
  where: Prisma.DataImportWhereInput,
  include: Prisma.DataImportInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<DataImport[]> => {
  const dataImports: DataImport[] = await prisma.dataImport.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    dataImports,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataImportQueryFirst = async (
  where: Prisma.DataImportWhereInput,
  include: Prisma.DataImportInclude | undefined
): Promise<DataImport> => {
  const dataImportInDb = await prisma.dataImport.findFirst({
    where,
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    dataImportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataImportQueryCount = async (
  where: Prisma.DataImportWhereInput
): Promise<number> => {
  return prisma.dataImport.count({
    where,
  });
};

export const daoDataImportCreate = async (
  data: Prisma.DataImportCreateInput
): Promise<DataImport> => {
  const dataImportInDb: DataImport = await prisma.dataImport.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    dataImportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataImportGetById = async (
  id: number,
  include?: Prisma.DataImportInclude | undefined
): Promise<DataImport> => {
  const dataImportInDb: DataImport | null = await prisma.dataImport.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    dataImportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataImportUpdate = async (
  id: number,
  data: Prisma.DataImportUpdateInput
): Promise<DataImport> => {
  const dataImportInDb: DataImport = await prisma.dataImport.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    dataImportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataImportGetStatusById = async (
  id: number
): Promise<DataImport> => {
  const dataImportInDb = await prisma.dataImport.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      mapping: true,
      log: true,
      errors: true,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    dataImportInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoDataImportDelete = async (id: number): Promise<DataImport> => {
  const term: DataImport = await prisma.dataImport.delete({
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
  daoDataImportQuery,
  daoDataImportQueryFirst,
  daoDataImportQueryCount,
  daoDataImportGetById,
  daoDataImportCreate,
  daoDataImportUpdate,
  daoDataImportDelete,
  daoDataImportGetStatusById,
};
export default defaults;
