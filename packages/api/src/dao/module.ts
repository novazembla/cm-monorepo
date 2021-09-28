import { Module, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoModuleQueryAll = async (): Promise<Module[]> => {
  const modules: Module[] = await prisma.module.findMany();

  return filteredOutputByBlacklist(
    modules,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoModuleGetWithTaxonomiesByKey = async (
  where: Prisma.ModuleWhereInput,
  include?: Prisma.ModuleInclude | undefined
): Promise<Module> => {
  const module = await prisma.module.findFirst({
    where,
    include,
  });

  return filteredOutputByBlacklist(
    module,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export default {
  daoModuleQueryAll,
  daoModuleGetWithTaxonomiesByKey,
};
