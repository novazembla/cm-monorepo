import { Import, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoImportQuery = async (
  where: Prisma.ImportWhereInput,
  include: Prisma.ImportInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Import[]> => {
  const imports: Import[] = await prisma.import.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    imports,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoImportQueryFirst = async (
  where: Prisma.ImportWhereInput,
  include: Prisma.ImportInclude | undefined
): Promise<Import> => {
  const importInDb = await prisma.import.findFirst({
    where,
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    importInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoImportQueryCount = async (
  where: Prisma.ImportWhereInput
): Promise<number> => {
  return prisma.import.count({
    where,
  });
};

export const daoImportCreate = async (
  data: Prisma.ImportCreateInput
): Promise<Import> => {
  const importInDb: Import = await prisma.import.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    importInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoImportGetById = async (
  id: number,
  include?: Prisma.ImportInclude | undefined
): Promise<Import> => {
  const importInDb: Import | null = await prisma.import.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    importInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoImportUpdate = async (
  id: number,
  data: Prisma.ImportUpdateInput
): Promise<Import> => {
  const importInDb: Import = await prisma.import.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    importInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoImportGetStatusById = async (id: number): Promise<Import> => {
  const importInDb = await prisma.import.findUnique({
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
    importInDb,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoImportDelete = async (id: number): Promise<Import> => {
  const term: Import = await prisma.import.delete({
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
  daoImportQuery,
  daoImportQueryFirst,
  daoImportQueryCount,
  daoImportGetById,
  daoImportCreate,
  daoImportUpdate,
  daoImportDelete,
  daoImportGetStatusById,
};
export default defaults;
