// import httpStatus from "http-status";
import { Term, /* Term, */ Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { /* ApiError, */ filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export const daoTermQuery = async (
  taxonomyId: number,
  where: Prisma.TermWhereInput,
  orderBy: Prisma.TermOrderByInput,
  pageIndex: number = 0,
  pageSize: number = config.db.defaultPageSize
): Promise<Term[]> => {
  const terms: Term[] = await prisma.term.findMany({
    where: {
      ...where,
      taxonomyId,
    },
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, config.db.maxPageSize),
  });

  return filteredOutputByBlacklist(terms, config.db.privateJSONDataKeys.term);
};

export const daoTermQueryCount = async (
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

  return filteredOutputByBlacklist(terms, config.db.privateJSONDataKeys.term);
};

export const daoTermCreate = async (
  data: Prisma.TermCreateInput
): Promise<Term> => {
  // TODO: hash check
  // if (await daoTermCheckIsEmailTaken(data.email)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  // }

  const term: Term = await prisma.term.create({
    data,
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.term
  );
};

export const daoTermGetById = async (id: number): Promise<Term> => {
  const term: Term | null = await prisma.term.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.term
  );
};

// export const daoTermCheckHash = async (
//   hash: string
// ): Promise<boolean> => {
//   console.log("TODO: check for hash", hash);

//   return true;

//   let where: Prisma.TermWhereInput = {
//     hash,
//   };

//   const count = await prisma.term.count({
//     where,
//   });

//   return count > 0;
// };

export const daoTermUpdate = async (
  id: number,
  data: Prisma.TermUpdateInput
): Promise<Term> => {
  // TODO: hash check
  // if (await daoTermCheckIsEmailTaken(data.email)) {
  //   throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
  // }

  const term: Term = await prisma.term.update({
    data,
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    term,
    config.db.privateJSONDataKeys.term
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
    config.db.privateJSONDataKeys.term
  );
};

export default {
  daoTermQuery,
  daoTermQueryCount,
  daoTermGetById,
  daoTermGetTermsByTaxonomyId,
  // daoTermCreate,
  // daoTermUpdate,
  // daoTermDelete,
  // daoTermCheckHash,
};
