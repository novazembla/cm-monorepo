/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  intArg,
  arg,
  list,
} from "nexus";
import httpStatus from "http-status";
import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoLocationExportGetById,
  daoLocationExportQuery,
  daoLocationExportQueryCount,
  daoLocationExportCreate,
} from "../../dao";
import { Prisma } from ".prisma/client";
import { LocationExportStatus } from "@culturemap/core";
import { locationExportDelete } from "../../services/serviceLocationExport";

const apiConfig = getApiConfig();

export const LocationExport = objectType({
  name: "LocationExport",
  definition(t) {
    t.nonNull.int("id");
    t.json("title");
    t.json("log");
    t.json("errors");
    t.json("meta");
    t.int("status");
    t.json("file");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const LocationExportQueryResult = objectType({
  name: "LocationExportQueryResult",
  description: dedent`
    List all the location exports in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("locationExports", {
      type: list("LocationExport"),
    });
  },
});

export const LocationExportQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("locationExports", {
      type: LocationExportQueryResult,

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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let locationExports;
        let include = {};
        let where: Prisma.LocationExportWhereInput = {
          ...args.where,
          status: {
            not: {
              in: [LocationExportStatus.DELETED],
            },
          },
        };

        if (
          (pRI?.fieldsByTypeName?.LocationExportQueryResult as any)?.totalCount
        ) {
          totalCount = await daoLocationExportQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              imports: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.LocationExportQueryResult as any)
            ?.locationExports
        )
          locationExports = await daoLocationExportQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          locationExports,
        };
      },
    });

    t.nonNull.field("locationExportRead", {
      type: "LocationExport",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoLocationExportGetById(args.id, { file: true });
      },
    });
  },
});

export const LocationExportUpsertInput = inputObjectType({
  name: "LocationExportUpsertInput",
  definition(t) {
    t.nonNull.string("title");
    t.json("meta");
  },
});

export const LocationExportMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("locationExportCreate", {
      type: "LocationExport",

      args: {
        data: nonNull("LocationExportUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args, ctx]) {
        const location = await daoLocationExportCreate({
          ...args.data,
          owner: {
            connect: {
              id: ctx?.apiUser?.id ?? 0,
            },
          },
          status: LocationExportStatus.PROCESS,
        });

        if (!location)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return location;
      },
    });

    t.nonNull.field("locationExportDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args]) {
        const location = await locationExportDelete(args.id);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
