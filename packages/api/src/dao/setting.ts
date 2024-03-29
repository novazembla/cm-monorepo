import { Setting, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";
import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export type SettingUpdateData = {
  key: string;
  scope: string;
  value: any;
};

export const daoSettingQuery = async (
  where: Prisma.SettingWhereInput
): Promise<Setting[]> => {
  const settings: Setting[] = await prisma.setting.findMany({
    where,
    orderBy: {
      key: "asc",
    },
  });
  return filteredOutputByBlacklist(
    settings,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoSettingGetById = async (id: number): Promise<Setting> => {
  const setting: Setting | null = await prisma.setting.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    setting,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoSettingGetByKey = async (key: string): Promise<Setting> => {
  const setting: Setting | null = await prisma.setting.findFirst({
    where: { key },
  });

  return filteredOutputByBlacklistOrNotFound(
    setting,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoSettingUpsert = async (
  key: string,
  createData: Prisma.SettingCreateInput,
  updateData: Prisma.SettingUpdateInput
): Promise<Setting> => {
  const setting: Setting = await prisma.setting.upsert({
    create: createData,
    update: updateData,
    where: {
      key,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    setting,
    apiConfig.db.privateJSONDataKeys.all
  );
};

const defaults = {
  daoSettingQuery,
  daoSettingGetById,
  daoSettingGetByKey,
  daoSettingUpsert,
};

export default defaults;
