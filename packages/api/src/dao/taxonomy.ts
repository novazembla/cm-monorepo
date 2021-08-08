import httpStatus from "http-status";
import { Taxonomy, Term, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoTermGetTermsByTaxonomyId,
  daoTermGetTermsCountByTaxonomyId,
} from "./term";
import { daoSharedCheckSlugUnique } from "./shared";

const prisma = getPrismaClient();

export const daoTaxonomyCheckSlugUnique = async (
  slug: Record<string, string>,
  id?: number,
  uniqueInObject?: boolean
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.taxonomy.findMany,
    slug,
    id,
    uniqueInObject
  );
};

export const daoTaxonomyQuery = async (
  where: Prisma.TaxonomyWhereInput,
  orderBy: Prisma.TaxonomyOrderByInput | Prisma.TaxonomyOrderByInput[],
  include: Prisma.TaxonomyInclude | undefined,
  pageIndex: number = 0,
  pageSize: number = config.db.defaultPageSize
): Promise<Taxonomy[]> => {
  const taxonomies: Taxonomy[] = await prisma.taxonomy.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, config.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    taxonomies,
    config.db.privateJSONDataKeys.taxonomy
  );
};

export const daoTaxonomyQueryCount = async (
  where: Prisma.TaxonomyWhereInput
): Promise<number> => {
  return prisma.taxonomy.count({
    where,
  });
};

export const daoTaxonomyGetTerms = async (id: number): Promise<Term[]> => {
  return daoTermGetTermsByTaxonomyId(id);
};

export const daoTaxonomyGetById = async (id: number): Promise<Taxonomy> => {
  const taxonomy: Taxonomy | null = await prisma.taxonomy.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    config.db.privateJSONDataKeys.taxonomy
  );
};

export const daoTaxonomyCreate = async (
  data: Prisma.TaxonomyCreateInput
): Promise<Taxonomy> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.taxonomy.findMany,
    data.slug as Record<string, string>
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const taxonomy: Taxonomy = await prisma.taxonomy.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    config.db.privateJSONDataKeys.taxonomy
  );
};

export const daoTaxonomyUpdate = async (
  id: number,
  data: Prisma.TaxonomyUpdateInput
): Promise<Taxonomy> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.taxonomy.findMany,
    data.slug as Record<string, string>,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const taxonomy: Taxonomy = await prisma.taxonomy.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    config.db.privateJSONDataKeys.taxonomy
  );
};

export const daoTaxonomyDelete = async (id: number): Promise<Taxonomy> => {
  const termCount = await daoTermGetTermsCountByTaxonomyId(id);
  if (termCount > 0)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `You cannot delete the taxonomy as it still has ${termCount} terms`
    );

  const taxonomy: Taxonomy = await prisma.taxonomy.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    config.db.privateJSONDataKeys.taxonomy
  );
};

export default {
  daoTaxonomyQuery,
  daoTaxonomyQueryCount,
  daoTaxonomyGetById,
  daoTaxonomyCheckSlugUnique,
  daoTaxonomyCreate,
  daoTaxonomyUpdate,
  daoTaxonomyDelete,
};
