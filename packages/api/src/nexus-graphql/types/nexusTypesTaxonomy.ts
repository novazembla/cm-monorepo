/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  // stringArg,
  intArg,
  arg,
  list,
} from "nexus";
import httpStatus from "http-status";
import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser } from "../helpers";

import config from "../../config";

import {
  daoTaxonomyQuery,
  daoTaxonomyQueryCount,
  daoTaxonomyGetById,
  daoTaxonomyGetTerms,
  daoTaxonomyCreate,
  daoTaxonomyUpdate,
  daoTaxonomyDelete,
} from "../../dao";

export const Taxonomy = objectType({
  name: "Taxonomy",
  definition(t) {
    t.nonNull.int("id");
    t.json("name");
    t.json("slug");
    t.date("createdAt");
    t.date("updatedAt");
    t.int("termCount", {
      resolve(...[parent]) {
        return (parent as any)?._count?.terms ?? 0;
      },
    });
    t.field("terms", {
      type: list("Term"),

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "taxRead"),

      async resolve(...[parent]) {
        return daoTaxonomyGetTerms(parent.id);
      },
    });
  },
});

export const TaxonomyQueryResult = objectType({
  name: "TaxonomyQueryResult",
  description: dedent`
    List all the taxonomies in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("taxonomies", {
      type: list(Taxonomy),
    });
  },
});

export const TaxonomyQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("taxonomies", {
      type: TaxonomyQueryResult,

      args: {
        pageIndex: intArg({
          default: 0,
        }),
        pageSize: intArg({
          default: config.db.defaultPageSize,
        }),
        orderBy: arg({
          type: GQLJson,
          default: undefined,
        }),
        where: arg({
          type: GQLJson,
          default: undefined,
        }),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "taxRead"),

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let taxonomies;
        let include;

        if ((pRI?.fieldsByTypeName?.TaxonomyQueryResult as any)?.totalCount) {
          totalCount = await daoTaxonomyQueryCount(args.where);

          if (totalCount === 0)
            return {
              totalCount,
              taxonomies: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.TaxonomyQueryResult as any)?.taxonomies
            ?.fieldsByTypeName?.Taxonomy?.termCount
        )
          include = {
            _count: {
              select: {
                terms: true,
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.TaxonomyQueryResult as any)?.taxonomies)
          taxonomies = await daoTaxonomyQuery(
            args.where,
            args.orderBy,
            include,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          taxonomies,
        };
      },
    });

    t.nonNull.field("taxonomyRead", {
      type: "Taxonomy",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "taxRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoTaxonomyGetById(args.id);
      },
    });
  },
});

export const TaxonomyCreateInput = inputObjectType({
  name: "TaxonomyCreateInput",
  definition(t) {
    t.nonNull.json("name");
    t.nonNull.json("slug");
  },
});
export const TaxonomyUpdateInput = inputObjectType({
  name: "TaxonomyUpdateInput",
  definition(t) {
    t.nonNull.json("name");
    t.nonNull.json("slug");
  },
});

export const TaxonomyMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("taxonomyCreate", {
      type: "Taxonomy",

      args: {
        data: nonNull(TaxonomyCreateInput),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "taxCreate"),

      async resolve(...[, args]) {
        const taxonomy = await daoTaxonomyCreate(args.data);

        if (!taxonomy)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return taxonomy;
      },
    });

    t.nonNull.field("taxonomyUpdate", {
      type: "Taxonomy",

      args: {
        id: nonNull(intArg()),
        data: nonNull(TaxonomyUpdateInput),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "taxUpdate"),

      async resolve(...[, args]) {
        const taxonomy = await daoTaxonomyUpdate(args.id, args.data);

        if (!taxonomy)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return taxonomy;
      },
    });

    t.nonNull.field("taxonomyDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "taxDelete"),

      async resolve(...[, args]) {
        const taxonomy = await daoTaxonomyDelete(args.id);

        if (!taxonomy)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});