import httpStatus from "http-status";
import { Taxonomy, Term, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoTermGetTermsByTaxonomyId,
  daoTermGetTermsCountByTaxonomyId,
} from "./term";
import { daoSharedCheckSlugUnique, daoSharedGenerateFullText } from "./shared";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

const taxFullTextKeys = ["name", "slug"];

export const daoTaxonomyCheckSlugUnique = async (
  slug: Record<string, string>,
  uniqueInObject: boolean,
  id?: number
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.taxonomy.findMany,
    slug,
    uniqueInObject,
    id
  );
};

export const daoTaxonomyQuery = async (
  where: Prisma.TaxonomyWhereInput,
  include: Prisma.TaxonomyInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Taxonomy[]> => {
  const taxonomies: Taxonomy[] = await prisma.taxonomy.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    taxonomies,
    apiConfig.db.privateJSONDataKeys.taxonomy
  );
};

export const daoTaxonomyQueryFirst = async (
  where: Prisma.TaxonomyWhereInput,
  include?: Prisma.TaxonomyInclude | undefined,
  orderBy?: any,
  pageIndex?: number,
  pageSize?: number
): Promise<Taxonomy> => {
  const taxonomy = await prisma.taxonomy.findFirst({
    where,
    include,
    orderBy,
    skip: (pageIndex ?? 0) * (pageSize ?? apiConfig.db.defaultPageSize),
    take: Math.min(
      pageSize ?? apiConfig.db.defaultPageSize,
      apiConfig.db.maxPageSize
    ),
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    apiConfig.db.privateJSONDataKeys.taxonomy
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
    apiConfig.db.privateJSONDataKeys.taxonomy
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
    data: {
      ...data,
      fullText: daoSharedGenerateFullText(data, taxFullTextKeys),
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    apiConfig.db.privateJSONDataKeys.taxonomy
  );
};

export const daoTaxonomyUpdate = async (
  id: number,
  data: Prisma.TaxonomyUpdateInput
): Promise<Taxonomy> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.taxonomy.findMany,
    data.slug as Record<string, string>,
    true,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  const taxonomy: Taxonomy = await prisma.taxonomy.update({
    data: {
      ...data,
      fullText: daoSharedGenerateFullText(data, taxFullTextKeys),
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    apiConfig.db.privateJSONDataKeys.taxonomy
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
    apiConfig.db.privateJSONDataKeys.taxonomy
  );
};

const defaults = {
  daoTaxonomyQuery,
  daoTaxonomyQueryFirst,
  daoTaxonomyQueryCount,
  daoTaxonomyGetById,
  daoTaxonomyCheckSlugUnique,
  daoTaxonomyCreate,
  daoTaxonomyUpdate,
  daoTaxonomyDelete,
};
export default defaults;
