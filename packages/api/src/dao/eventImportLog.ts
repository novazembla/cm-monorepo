import { EventImportLog, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoEventImportLogQuery = async (
  where: Prisma.EventImportLogWhereInput,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<EventImportLog[]> => {
  const eventImportLogs: EventImportLog[] =
    await prisma.eventImportLog.findMany({
      where,
      orderBy,
      skip: pageIndex * pageSize,
      take: Math.min(pageSize, apiConfig.db.maxPageSize),
    });

  return filteredOutputByBlacklist(
    eventImportLogs,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventImportLogQueryCount = async (
  where: Prisma.EventImportLogWhereInput
): Promise<number> => {
  return prisma.eventImportLog.count({
    where,
  });
};

export const daoEventImportLogGetById = async (
  id: number
): Promise<EventImportLog> => {
  const eventImportLog: EventImportLog | null =
    await prisma.eventImportLog.findUnique({
      where: { id },
    });

  return filteredOutputByBlacklistOrNotFound(
    eventImportLog,
    apiConfig.db.privateJSONDataKeys.event
  );
};

const defaults = {
  daoEventImportLogQuery,
  daoEventImportLogQueryCount,
  daoEventImportLogGetById,
};

export default defaults;
