// import httpStatus from "http-status";
import { Taxonomy, Term, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { /* ApiError, */ filteredOutputByBlacklistOrNotFound } from "../utils";
import config from "../config";
import { getPrismaClient } from "../db/client";
import { daoTermGetTermsByTaxonomyId } from "./term";

const prisma = getPrismaClient();

export const daoTaxonomyQuery = async (
  where: Prisma.TaxonomyWhereInput,
  orderBy: Prisma.TaxonomyOrderByInput,
  pageIndex: number = 0,
  pageSize: number = config.db.defaultPageSize
): Promise<Taxonomy[]> => {
  const taxonomies: Taxonomy[] = await prisma.taxonomy.findMany({
    where,
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

// export const daoTaxonomyCheckHash = async (
//   hash: string
// ): Promise<boolean> => {
//   console.log("TODO: check for hash", hash);

//   return true;

//   let where: Prisma.TaxonomyWhereInput = {
//     hash,
//   };

//   const count = await prisma.taxonomy.count({
//     where,
//   });

//   return count > 0;
// };

// export const daoTaxonomyCreate = async (
//   data: Prisma.TaxonomyCreateInput
// ): Promise<Taxonomy> => {
//   if (await daoTaxonomyCheckHash(data)) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Email already taken");
//   }

//   const taxonomy: Taxonomy = await prisma.taxonomy.create({
//     data: {
//       ...data,
//       ...{
//         password: await hash(data.password),
//       },
//     },
//   });

//   return filteredOutputByBlacklistOrNotFound(
//     taxonomy,
//     config.db.privateJSONDataKeys.taxonomy
//   );
// };

export const daoTaxonomyGetById = async (id: number): Promise<Taxonomy> => {
  const taxonomy: Taxonomy | null = await prisma.taxonomy.findUnique({
    where: { id },
  });

  return filteredOutputByBlacklistOrNotFound(
    taxonomy,
    config.db.privateJSONDataKeys.taxonomy
  );
};

// export const daoTaxonomyUpdate = async (
//   id: number,
//   data: Prisma.TaxonomyUpdateInput
// ): Promise<Taxonomy> => {
//   let updateData = data;

//   if (data.password)
//     updateData = {
//       ...data,
//       ...{ password: await hash(data.password as string) },
//     };

//   const taxonomy: Taxonomy = await prisma.taxonomy.update({
//     data: updateData,
//     where: {
//       id,
//     },
//   });

//   return filteredOutputByBlacklistOrNotFound(
//     taxonomy,
//     config.db.privateJSONDataKeys.taxonomy
//   );
// };

// export const daoTaxonomyDelete = async (id: number): Promise<Taxonomy> => {
//   const taxonomy: Taxonomy = await prisma.taxonomy.delete({
//     where: {
//       id,
//     },
//   });

//   return filteredOutputByBlacklistOrNotFound(
//     taxonomy,
//     config.db.privateJSONDataKeys.taxonomy
//   );
// };

export default {
  daoTaxonomyQuery,
  daoTaxonomyQueryCount,
  daoTaxonomyGetById,
  // daoTaxonomyCreate,
  // daoTaxonomyUpdate,
  // daoTaxonomyDelete,
  // daoTaxonomyCheckHash,
};
