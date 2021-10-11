/// <reference path="../../types/nexus-typegen.ts" />

import dedent from "dedent";
import { objectType, extendType, nonNull, intArg, arg, list } from "nexus";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoEventImportLogQueryCount,
  daoEventImportLogQuery,
  daoEventImportLogGetById,
} from "../../dao";

const apiConfigOnBoot = getApiConfig();

export const EventImportLog = objectType({
  name: "EventImportLog",
  definition(t) {
    t.nonNull.int("id");
    t.json("log");
    t.json("errors");
    t.json("warnings");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const EventImportLogQueryResult = objectType({
  name: "EventImportLogQueryResult",
  description: dedent`
    List all the event import logs in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("eventImportLogs", {
      type: list("EventImportLog"),
    });
  },
});

export const EventImportLogQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("eventImportLogs", {
      type: EventImportLogQueryResult,

      args: {
        pageIndex: intArg({
          default: 0,
        }),
        pageSize: intArg({
          default: apiConfigOnBoot.db.defaultPageSize,
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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "eventRead"),

      async resolve(...[, args]) {
        let totalCount;
        let eventImportLogs;

        totalCount = await daoEventImportLogQueryCount(args.where);

        if (totalCount === 0)
          return {
            totalCount,
            eventImportLogs: [],
          };

        eventImportLogs = await daoEventImportLogQuery(
          args.where,
          {
            updatedAt: "desc",
          },
          args.pageIndex as number,
          args.pageSize as number
        );

        return {
          totalCount,
          eventImportLogs,
        };
      },
    });

    t.nonNull.field("eventImportLog", {
      type: "EventImportLog",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "eventRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoEventImportLogGetById(args.id);
      },
    });
  },
});
