import { Setting, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";
import { filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export type SettingUpdateData = {
  key: string;
  value: any;
};

export const daoSettingQuery = async (): Promise<Setting[]> => {
  const settings: Setting[] = await prisma.setting.findMany();

  return filteredOutputByBlacklist(settings, config.db.privateJSONDataKeys.all);
};

export const daoSettingGetById = async (id: number): Promise<Setting> => {
  const setting: Setting | null = await prisma.setting.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    setting,
    config.db.privateJSONDataKeys.all
  );
};

export const daoSettingUpsert = async (
  key: string,
  data: Prisma.SettingUpdateInput | Prisma.SettingCreateInput
): Promise<Setting> => {
  const setting: Setting = await prisma.setting.upsert({
    create: data as Prisma.SettingCreateInput,
    update: data as Prisma.SettingUpdateInput,
    where: {
      key,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    setting,
    config.db.privateJSONDataKeys.all
  );
};

export default {
  daoSettingQuery,
  daoSettingGetById,
  daoSettingUpsert,
};
