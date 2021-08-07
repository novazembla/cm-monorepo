import httpStatus from "http-status";
import { Page, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";
import { getPrismaClient } from "../db/client";
import { daoSharedCheckSlugUnique } from "./shared";

const prisma = getPrismaClient();

export const daoPageCheckSlugUnique = async (
  slug: Record<string, string>,
  id?: number,
  uniqueInObject?: boolean
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.page.findMany,
    slug,
    id,
    uniqueInObject
  );
};

export const daoPageQuery = async (
  taxonomyId: number,
  where: Prisma.PageWhereInput,
  orderBy: Prisma.PageOrderByInput,
  pageIndex: number = 0,
  pageSize: number = config.db.defaultPageSize
): Promise<Page[]> => {
  const pages: Page[] = await prisma.page.findMany({
    where,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, config.db.maxPageSize),
  });

  return filteredOutputByBlacklist(pages, config.db.privateJSONDataKeys.page);
};

export const daoPageQueryCount = async (
  taxonomyId: number,
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
    data.slug as Record<string, string>
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(", ")}]`
    );

  const term: Page = await prisma.page.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.page
  );
};

export const daoPageGetById = async (id: number): Promise<Page> => {
  const term: Page | null = await prisma.page.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.page
  );
};

export const daoPageUpdate = async (
  id: number,
  data: Prisma.PageUpdateInput
): Promise<Page> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.page.findMany,
    data.slug as Record<string, string>
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(", ")}]`
    );

  const term: Page = await prisma.page.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.page
  );
};

export const daoPageDelete = async (id: number): Promise<Page> => {
  const term: Page = await prisma.page.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.page
  );
};

export default {
  daoPageQuery,
  daoPageQueryCount,
  daoPageGetById,
  daoPageCheckSlugUnique,
  daoPageCreate,
  daoPageUpdate,
  daoPageDelete,
};
