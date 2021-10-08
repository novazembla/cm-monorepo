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
  daoImportGetById,
  daoImportQuery,
  daoImportQueryCount,
  daoImportCreate,
  daoImportUpdate,
  daoFileSetToDelete,
  daoFileGetById,
} from "../../dao";
import { Prisma } from ".prisma/client";
import { ImportStatus } from "@culturemap/core";
import { importDelete } from "../../services/serviceImport";

const apiConfig = getApiConfig();

export const Import = objectType({
  name: "Import",
  definition(t) {
    t.nonNull.int("id");
    t.json("title");
    t.json("log");
    t.json("errors");
    t.json("mapping");
    t.int("status");
    t.json("file");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const ImportQueryResult = objectType({
  name: "ImportQueryResult",
  description: dedent`
    List all the imports in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("imports", {
      type: list("Import"),
    });
  },
});

export const ImportQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("imports", {
      type: ImportQueryResult,

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
        let imports;
        let include = {};
        let where: Prisma.ImportWhereInput = {
          ...args.where,
          status: {
            not: {
              in: [ImportStatus.DELETED],
            },
          },
        };

        if ((pRI?.fieldsByTypeName?.ImportQueryResult as any)?.totalCount) {
          totalCount = await daoImportQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              imports: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.ImportQueryResult as any)?.imports)
          imports = await daoImportQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          imports,
        };
      },
    });

    t.nonNull.field("importRead", {
      type: "Import",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoImportGetById(args.id, { file: true });
      },
    });
  },
});

export const ImportUpsertInput = inputObjectType({
  name: "ImportUpsertInput",
  definition(t) {
    t.nonNull.string("title");
    t.json("log");
    t.json("errors");
    t.json("mapping");
    t.nonNull.int("status");
  },
});

export const ImportMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("importCreate", {
      type: "Import",

      args: {
        data: nonNull("ImportUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args, ctx]) {
        const location = await daoImportCreate({
          ...args.data,
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

    t.nonNull.field("importUpdate", {
      type: "Import",

      args: {
        id: nonNull(intArg()),
        data: nonNull("ImportUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args]) {
        const location = await daoImportUpdate(args.id, args.data);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return location;
      },
    });

    t.nonNull.field("importFileDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args]) {
        const fileInDb: any = await daoFileGetById(args.id, {
          imports: true,
        });

        if (!fileInDb)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        if (
          fileInDb &&
          Array.isArray(fileInDb?.imports) &&
          fileInDb?.imports.length > 0
        ) {
          const ids = fileInDb?.imports.map((imp: any) => imp.id);

          if (ids && ids.length > 0)
            await daoImportUpdate(ids[0], {
              log: [],
              errors: [],
              mapping: [],
              status: ImportStatus.CREATED,
            });
        }

        const file = await daoFileSetToDelete(fileInDb.id);

        if (!file)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });

    t.nonNull.field("importDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args]) {
        const location = await importDelete(args.id);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
