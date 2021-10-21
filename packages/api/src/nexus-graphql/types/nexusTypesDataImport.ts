/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  intArg,
  stringArg,
  arg,
  list,
} from "nexus";
import httpStatus from "http-status";
import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser, apiUserCan } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoDataImportGetById,
  daoDataImportQuery,
  daoDataImportCreate,
  daoDataImportUpdate,
  daoFileSetToDelete,
  daoFileGetById,
  daoDataImportQueryCount,
} from "../../dao";
import { Prisma } from ".prisma/client";
import { DataImportStatus } from "@culturemap/core";
import { dataImportDelete } from "../../services/serviceDataImport";

const apiConfig = getApiConfig();

export const DataImport = objectType({
  name: "DataImport",
  definition(t) {
    t.nonNull.int("id");
    t.json("title");
    t.json("log");
    t.json("errors");
    t.json("warnings");
    t.json("mapping");
    t.int("status");
    t.field("file", {
      type: "File",
    });

    t.string("lang");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const DataImportQueryResult = objectType({
  name: "DataImportQueryResult",
  description: dedent`
    List all the imports in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("dataImports", {
      type: list("DataImport"),
    });
  },
});

export const DataImportQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("dataImports", {
      type: DataImportQueryResult,

      args: {
        pageIndex: intArg({
          default: 0,
        }),
        pageSize: intArg({
          default: apiConfig.db.defaultPageSize,
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

      authorize: (...[, args, ctx]) => {
        const type = args?.where?.type ?? "none";
        return authorizeApiUser(ctx, `${type}ReadOwn` as any);
      },

      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        const type = args?.where?.type ?? "none";
        let totalCount;
        let dataImports;
        let include: Prisma.DataImportInclude = {};
        let where: Prisma.DataImportWhereInput = {
          ...args.where,
          status: {
            not: {
              in: [DataImportStatus.DELETED],
            },
          },
        };

        if (!apiUserCan(ctx, `${type}Read` as any)) {
          where = {
            ...where,
            owner: {
              id: ctx?.apiUser?.id ?? 0,
            },
          };
        }

        if ((pRI?.fieldsByTypeName?.DataImportQueryResult as any)?.totalCount) {
          totalCount = await daoDataImportQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              dataImports: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.DataImportQueryResult as any)?.dataImports)
          dataImports = await daoDataImportQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          dataImports,
        };
      },
    });

    t.nonNull.field("dataImportRead", {
      type: "DataImport",

      args: {
        id: nonNull(intArg()),
        type: nonNull(stringArg()),
      },

      authorize: async (...[, args, ctx]) => {
        const type = args?.type ?? "none";

        if (!authorizeApiUser(ctx, `${type}UpdateOwn` as any)) return false;

        if (apiUserCan(ctx, `${type}Update` as any)) return true;

        const count = await daoDataImportQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoDataImportGetById(args.id, { file: true });
      },
    });
  },
});

export const DataImportUpsertInput = inputObjectType({
  name: "DataImportUpsertInput",
  definition(t) {
    t.nonNull.string("title");
    t.nonNull.string("type");
    t.json("log");
    t.json("errors");
    t.json("warnings");
    t.json("mapping");
    t.string("lang");
    t.nonNull.int("status");
  },
});

export const DataImportMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("dataImportCreate", {
      type: "DataImport",

      args: {
        data: nonNull("DataImportUpsertInput"),
      },

      authorize: (...[, args, ctx]) => {
        const type = args?.data?.type ?? "none";
        return authorizeApiUser(ctx, `${type}Create` as any);
      },

      async resolve(...[, args, ctx]) {
        const location = await daoDataImportCreate({
          ...args.data,
          lang: args.data?.lang ?? "en",
          owner: {
            connect: {
              id: ctx?.apiUser?.id ?? 0,
            },
          },
        });

        if (!location)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return location;
      },
    });

    t.nonNull.field("dataImportUpdate", {
      type: "DataImport",

      args: {
        id: nonNull(intArg()),
        data: nonNull("DataImportUpsertInput"),
      },

      authorize: async (...[, args, ctx]) => {
        const type = args?.data?.type ?? "none";
        if (!authorizeApiUser(ctx, `${type}UpdateOwn` as any)) return false;

        if (apiUserCan(ctx, `${type}Update` as any)) return true;

        const count = await daoDataImportQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const location = await daoDataImportUpdate(args.id, {
          ...args.data,
          lang: undefined,
        });

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return location;
      },
    });

    t.nonNull.field("dataImportFileDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
        type: nonNull(stringArg()),
      },

      authorize: async (...[, args, ctx]) => {
        const type = args?.type ?? "none";
        if (!authorizeApiUser(ctx, `${type}DeleteOwn` as any)) return false;

        if (apiUserCan(ctx, `${type}Delete` as any)) return true;

        const count = await daoDataImportQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const fileInDb: any = await daoFileGetById(args.id, {
          dataImports: true,
        });

        if (!fileInDb)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        if (
          fileInDb &&
          Array.isArray(fileInDb?.dataImports) &&
          fileInDb?.dataImports.length > 0
        ) {
          const ids = fileInDb?.dataImports.map((imp: any) => imp.id);

          if (ids && ids.length > 0)
            await daoDataImportUpdate(ids[0], {
              log: [],
              errors: [],
              mapping: [],
              warnings: [],
              status: DataImportStatus.CREATED,
            });
        }

        const file = await daoFileSetToDelete(fileInDb.id);

        if (!file)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });

    t.nonNull.field("dataImportDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
        type: nonNull(stringArg()),
      },

      authorize: async (...[, args, ctx]) => {
        const type = args?.type ?? "none";
        if (!authorizeApiUser(ctx, `${type}DeleteOwn` as any)) return false;

        if (apiUserCan(ctx, `${type}Delete` as any)) return true;

        const count = await daoDataImportQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const location = await dataImportDelete(args.id);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
