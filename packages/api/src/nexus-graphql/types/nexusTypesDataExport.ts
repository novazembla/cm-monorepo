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
  daoDataExportGetById,
  daoDataExportQuery,
  daoDataExportQueryCount,
  daoDataExportCreate,
} from "../../dao";
import { Prisma } from ".prisma/client";
import { ExportStatus } from "@culturemap/core";
import { dataExportDelete } from "../../services/serviceDataExport";

const apiConfig = getApiConfig();

export const DataExport = objectType({
  name: "DataExport",
  definition(t) {
    t.nonNull.int("id");
    t.json("title");
    t.string("lang");
    t.string("type");
    t.json("log");
    t.json("errors");
    t.json("meta");
    t.int("status");
    t.json("file");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const DataExportQueryResult = objectType({
  name: "DataExportQueryResult",
  description: dedent`
    List all the location exports in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("dataExports", {
      type: list("DataExport"),
    });
  },
});

export const DataExportQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("dataExports", {
      type: DataExportQueryResult,

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

      // authorize: (...[, args, ctx]) => {
      //   console.log(args);
      //   const type = args?.where?.type ?? "none";
      //   return authorizeApiUser(ctx, `${type}ReadOwn` as any);
      // },

      async resolve(...[, args, ctx, info]) {
        console.log(args);

        const pRI = parseResolveInfo(info);

        const type = args?.where?.type ?? "none";
        let totalCount;
        let dataExports;
        let include: Prisma.DataExportInclude = {};
        let where: Prisma.DataExportWhereInput = {
          ...args.where,
          status: {
            not: {
              in: [ExportStatus.DELETED],
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

        console.log(where);
        console.log(123);

        if ((pRI?.fieldsByTypeName?.DataExportQueryResult as any)?.totalCount) {
          totalCount = await daoDataExportQueryCount({});

          if (totalCount === 0)
            return {
              totalCount,
              imports: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.DataExportQueryResult as any)?.dataExports)
          dataExports = await daoDataExportQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          dataExports,
        };
      },
    });

    t.nonNull.field("dataExportRead", {
      type: "DataExport",

      args: {
        id: nonNull(intArg()),
        type: nonNull(stringArg()),
      },

      authorize: async (...[, args, ctx]) => {
        const type = args?.type ?? "none";

        if (!authorizeApiUser(ctx, `${type}UpdateOwn` as any)) return false;

        if (apiUserCan(ctx, `${type}Update` as any)) return true;

        const count = await daoDataExportQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoDataExportGetById(args.id, { file: true });
      },
    });
  },
});

export const DataExportUpsertInput = inputObjectType({
  name: "DataExportUpsertInput",
  definition(t) {
    t.nonNull.string("title");
    t.nonNull.string("type");
    t.string("lang");
    t.json("meta");
  },
});

export const DataExportMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("dataExportCreate", {
      type: "DataExport",

      args: {
        data: nonNull("DataExportUpsertInput"),
      },

      authorize: (...[, args, ctx]) => {
        const type = args?.data?.type ?? "none";
        return authorizeApiUser(ctx, `${type}Create` as any);
      },

      async resolve(...[, args, ctx]) {
        const location = await daoDataExportCreate({
          ...args.data,
          lang: args.data?.lang ?? "en",
          type: args.data?.type ?? "none",
          owner: {
            connect: {
              id: ctx?.apiUser?.id ?? 0,
            },
          },
          status: ExportStatus.PROCESS,
        });

        if (!location)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return location;
      },
    });

    t.nonNull.field("dataExportDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
        type: nonNull(stringArg()),
      },

      authorize: async (...[, args, ctx]) => {
        const type = args?.type ?? "none";
        if (!authorizeApiUser(ctx, `${type}DeleteOwn` as any)) return false;

        if (apiUserCan(ctx, `${type}Delete` as any)) return true;

        const count = await daoDataExportQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const location = await dataExportDelete(args.id);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
