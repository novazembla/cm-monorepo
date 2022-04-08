import httpStatus from "http-status";
import { Page, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedCheckSlugUnique,
  daoSharedGenerateFullText,
  daoSharedMapJsonToTranslatedColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoPageCheckSlugUnique = async (
  slug: Record<string, string>,
  uniqueInObject: boolean,
  id?: number
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.page.findMany,
    slug,
    uniqueInObject,
    id
  );
};

export const daoPageFullTextKeys = [
  "title",
  "slug",
  "intro",
  "content",
  "metaDesc",
];

export const daoPageTranslatedColumns = [
  "title",
  "slug",
  "intro",
  "content",
  "metaDesc",
];

export const daoPageQuery = async (
  where: Prisma.PageWhereInput,
  include: Prisma.PageInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Page[]> => {
  const pages: Page[] = await prisma.page.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    pages,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageQueryFirst = async (
  where: Prisma.PageWhereInput,
  include: Prisma.PageInclude | undefined
): Promise<Page> => {
  const page = await prisma.page.findFirst({
    where,
    include,
  });
  return filteredOutputByBlacklistOrNotFound(
    page,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageQueryCount = async (
  where: Prisma.PageWhereInput
): Promise<number> => {
  return prisma.page.count({
    where,
  });
};

export const daoPageCreate = async (
  data: Prisma.PageCreateInput
): Promise<Page> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.page.findMany,
    (data as any).slug
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let createData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoPageTranslatedColumns
  );

  const page: Page = await prisma.page.create({
    data: {
      ...createData,
      fullText: daoSharedGenerateFullText(
        createData,
        daoPageFullTextKeys,
        daoPageTranslatedColumns
      ),
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    page,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageGetById = async (
  id: number,
  include?: Prisma.PageInclude | undefined
): Promise<Page> => {
  const page: Page | null = await prisma.page.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    page,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageSelectQuery = async (
  where: Prisma.PageWhereInput,
  select: Prisma.PageSelect,
  orderBy?: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize * 3
): Promise<Page[]> => {
  const pages = await prisma.page.findMany({
    where,
    select,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    pages,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageGetBySlug = async (
  slug: string,
  include?: Prisma.PageInclude | undefined
): Promise<Page> => {
  const config = getApiConfig();

  const page = await prisma.page.findFirst({
    where: {
      OR: config?.activeLanguages.map((lang) => ({
        [`slug_${lang}`]: slug,
      })),
    },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    page,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageUpdate = async (
  id: number,
  data: Prisma.PageUpdateInput
): Promise<Page> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.page.findMany,
    (data as any).slug,
    true,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let updateData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoPageTranslatedColumns
  );

  const page: Page = await prisma.page.update({
    data: {
      ...updateData,
      fullText: daoSharedGenerateFullText(
        updateData,
        daoPageFullTextKeys,
        daoPageTranslatedColumns
      ),
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    page,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageDelete = async (id: number): Promise<Page> => {
  const page: Page = await prisma.page.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    page,
    apiConfig.db.privateJSONDataKeys.page
  );
};

export const daoPageChangeOwner = async (
  oldOwnerId: number,
  newOwnerId: number
): Promise<number> => {
  const result = await prisma.page.updateMany({
    data: {
      ownerId: newOwnerId,
    },

    where: {
      ownerId: oldOwnerId,
    },
  });

  return result.count;
};

const defaults = {
  daoPageChangeOwner,
  daoPageQuery,
  daoPageQueryCount,
  daoPageGetById,
  daoPageCheckSlugUnique,
  daoPageCreate,
  daoPageUpdate,
  daoPageDelete,
  daoPageSelectQuery,
  daoPageGetBySlug,
  daoPageQueryFirst,
};

export default defaults;
