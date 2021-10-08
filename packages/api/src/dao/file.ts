import { File, Prisma } from "@prisma/client";

import { FileStatus } from "@culturemap/core";

import { filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";

import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoFileTranslatedColumns = ["alt", "credits"];

export const daoFileGetById = async (
  id: number,
  include?: Prisma.FileInclude | undefined
): Promise<File> => {
  const file: File | null = await prisma.file.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    file,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoFileCreate = async (
  data: Prisma.FileCreateInput
): Promise<File> => {
  const file: File = await prisma.file.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    file,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoFileUpdate = async (
  id: number,
  data: Prisma.FileUpdateInput
): Promise<File> => {
  const file: File = await prisma.file.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    file,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoFileDelete = async (id: number): Promise<File> => {
  const file: File = await prisma.file.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    file,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoFileSetToDelete = async (id: number): Promise<File> => {
  const file: File = await prisma.file.update({
    data: {
      status: FileStatus.DELETED,

      imports: {
        set: [],
      },
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    file,
    apiConfig.db.privateJSONDataKeys.all
  );
};

export const daoFileGetStatusById = async (id: number): Promise<File> => {
  const file = await prisma.file.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      meta: true,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    file,
    apiConfig.db.privateJSONDataKeys.all
  );
};

const defaults = {
  daoFileGetById,
  daoFileCreate,
  daoFileUpdate,
  daoFileDelete,
  daoFileSetToDelete,
  daoFileGetStatusById,
  daoFileTranslatedColumns,
};

export default defaults;
