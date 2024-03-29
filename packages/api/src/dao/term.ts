import httpStatus from "http-status";
import { Term, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";
import {
  daoSharedCheckSlugUnique,
  daoSharedGenerateFullText,
  daoSharedMapJsonToTranslatedColumns,
} from "./shared";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoTermFullTextKeys = ["name", "slug"];

export const daoTermTranslatedColumns = ["name", "slug"];

export const daoTermCheckSlugUnique = async (
  slug: Record<string, string>,
  uniqueInObject: boolean,
  id?: number
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.term.findMany,
    slug,
    uniqueInObject,
    id
  );
};

export const daoTermsQuery = async (
  taxonomyId: number,
  where: Prisma.TermWhereInput,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Term[]> => {
  const terms: Term[] = await prisma.term.findMany({
    where: {
      ...where,
      taxonomyId,
    },
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    terms,
    apiConfig.db.privateJSONDataKeys.term
  );
};

export const daoTermQuery = async (
  where: Prisma.TermWhereInput,
  include?: Prisma.TermInclude
): Promise<Term> => {
  const term = await prisma.term.findFirst({
    where: {
      ...where,
    },
    include,
  });

  return filteredOutputByBlacklist(term, apiConfig.db.privateJSONDataKeys.term);
};

export const daoTermsQueryCount = async (
  taxonomyId: number,
  where: Prisma.TermWhereInput
): Promise<number> => {
  return prisma.term.count({
    where: {
      ...where,
      taxonomyId,
    },
  });
};

export const daoTermGetTermsByTaxonomyId = async (
  taxonomyId: number
): Promise<Term[]> => {
  const terms: Term[] = await prisma.term.findMany({
    where: {
      taxonomyId,
    },
  });

  return filteredOutputByBlacklist(
    terms,
    apiConfig.db.privateJSONDataKeys.term
  );
};

export const daoTermGetTermsCountByTaxonomyId = async (
  taxonomyId: number
): Promise<number> => {
  const count = await prisma.term.count({
    where: {
      taxonomyId,
    },
  });

  return count;
};

export const daoTermGetById = async (id: number): Promise<Term> => {
  const term: Term | null = await prisma.term.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    apiConfig.db.privateJSONDataKeys.term
  );
};

export const daoTermCreate = async (
  data: Prisma.TermCreateInput
): Promise<Term> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.term.findMany,
    (data as any).slug
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let dbData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoTermTranslatedColumns
  );

  const term: Term = await prisma.term.create({
    data: {
      ...dbData,
      fullText: daoSharedGenerateFullText(
        dbData,
        daoTermFullTextKeys,
        daoTermTranslatedColumns
      ),
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    apiConfig.db.privateJSONDataKeys.term
  );
};

export const daoTermUpdate = async (
  id: number,
  data: Prisma.TermUpdateInput
): Promise<Term> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.term.findMany,
    (data as any).slug,
    true,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let dbData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoTermTranslatedColumns
  );

  const term: Term = await prisma.term.update({
    data: {
      ...dbData,
      fullText: daoSharedGenerateFullText(
        dbData,
        daoTermFullTextKeys,
        daoTermTranslatedColumns
      ),
    },
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    apiConfig.db.privateJSONDataKeys.term
  );
};

export const daoTermDelete = async (id: number): Promise<Term> => {
  const term: Term = await prisma.term.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    apiConfig.db.privateJSONDataKeys.term
  );
};

const defaults = {
  daoTermsQuery,
  daoTermsQueryCount,
  daoTermGetById,
  daoTermGetTermsByTaxonomyId,
  daoTermGetTermsCountByTaxonomyId,
  daoTermCheckSlugUnique,
  daoTermCreate,
  daoTermUpdate,
  daoTermDelete,
};

export default defaults;
