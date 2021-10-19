/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { PublishStatus } from "@culturemap/core";
import { Prisma } from "@prisma/client";

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  stringArg,
  intArg,
  arg,
  list,
} from "nexus";
import httpStatus from "http-status";
import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser, apiUserCan } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoEventQuery,
  daoEventQueryCount,
  daoEventQueryFirst,
  daoEventCreate,
  daoEventDelete,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoSharedGetTranslatedSelectColumns,
} from "../../dao";

import { eventUpdate } from "../../services/serviceEvent";

const apiConfigOnBoot = getApiConfig();

export const EventDate = objectType({
  name: "EventDate",
  definition(t) {
    t.nonNull.int("id");
    t.date("date");
    t.date("begin");
    t.date("end");

    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const Event = objectType({
  name: "Event",
  definition(t) {
    t.nonNull.int("id");

    t.json("title", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "title"),
    });

    t.json("slug", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "slug"),
    });

    t.json("description", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "description"),
    });

    t.nonNull.int("ownerId");
    t.nonNull.int("status");

    t.json("meta");
    t.boolean("isFree");
    t.boolean("isImported");

    t.list.field("dates", {
      type: "EventDate",
    });

    t.list.field("terms", {
      type: "Term",
    });

    t.list.field("primaryTerms", {
      type: "Term",
    });

    t.list.field("locations", {
      type: "Location",
    });

    t.field("heroImage", {
      type: "Image",
    });

    t.string("address");
    t.string("organiser");

    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const EventQueryResult = objectType({
  name: "EventQueryResult",
  description: dedent`
    List all the events in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("events", {
      type: list("Event"),
    });
  },
});

export const EventQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("events", {
      type: EventQueryResult,

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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "eventReadOwn", true),

      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let events;
        let include: Prisma.EventInclude = {};
        let where: Prisma.EventWhereInput = args.where;

        // here needs to be the preview access bypass TODO:
        if (!apiUserCan(ctx, "eventReadOwn")) {
          where = {
            ...where,
            status: PublishStatus.PUBLISHED,
          };
        } else {
          if (!apiUserCan(ctx, "eventRead")) {
            where = {
              ...where,
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            };
          }
        }

        if ((pRI?.fieldsByTypeName?.EventQueryResult as any)?.totalCount) {
          totalCount = await daoEventQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              events: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.EventQueryResult as any)?.events
            ?.fieldsByTypeName?.Event?.terms
        ) {
          include = {
            ...include,
            terms: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              },
            },
            primaryTerms: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              },
            },
          };
        }

        if (
          (pRI?.fieldsByTypeName?.EventQueryResult as any)?.events
            ?.fieldsByTypeName?.Event?.dates
        ) {
          include = {
            ...include,
            dates: {
              select: {
                id: true,
                date: true,
                begin: true,
                end: true,
              },
            },
          };
        }

        if (
          (pRI?.fieldsByTypeName?.EventQueryResult as any)?.events
            ?.fieldsByTypeName?.Event?.locations
        ) {
          include = {
            ...include,
            locations: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "description",
                ]),
                lat: true,
                lng: true,
              },
            },
          };
        }

        if ((pRI?.fieldsByTypeName?.EventQueryResult as any)?.events)
          events = await daoEventQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          events,
        };
      },
    });

    t.nonNull.field("event", {
      type: "Event",

      args: {
        slug: stringArg(),
        id: intArg(),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "eventReadOwn", true),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const config = getApiConfig();
        const pRI = parseResolveInfo(info);

        let where: Prisma.EventWhereInput[] = [];
        let include: Prisma.EventInclude = {};

        if ((pRI?.fieldsByTypeName?.Event as any)?.terms)
          include = {
            ...include,
            terms: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              },
            },
            primaryTerms: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.Event as any)?.heroImage)
          include = {
            ...include,
            heroImage: {
              select: {
                id: true,
                status: true,
                meta: true,
                cropPosition: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
            },
          };

        if (args.slug && args.slug.trim() !== "") {
          where.push({
            OR: config?.activeLanguages.map((lang) => ({
              [`slug_${lang}`]: args.slug,
            })),
          });
        }

        if ((pRI?.fieldsByTypeName?.Event as any)?.dates)
          include = {
            ...include,
            dates: {
              select: {
                id: true,
                date: true,
                begin: true,
                end: true,
              },
              orderBy: {
                date: "asc",
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.Event as any)?.locations)
          include = {
            ...include,
            locations: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
                lat: true,
                lng: true,
              },
            },
          };

        if (args.id) {
          where.push({
            id: args.id,
          });
        }

        // here needs to be the preview access bypass TODO:
        if (!apiUserCan(ctx, "eventReadOwn")) {
          where.push({
            status: PublishStatus.PUBLISHED,
          });
        } else {
          if (!apiUserCan(ctx, "eventRead")) {
            where.push({
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            });
          }
        }

        if (Object.keys(where).length > 0) {
          return daoEventQueryFirst(
            where.length > 1 ? { AND: where } : where.shift() ?? {},
            Object.keys(include).length > 0 ? include : undefined
          );
        } else {
          throw new ApiError(httpStatus.NOT_FOUND, "Not found");
        }
      },
    });
  },
});

export const EventUpsertInput = inputObjectType({
  name: "EventUpsertInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.int("status");
    t.nonNull.boolean("isFree");
    t.nonNull.boolean("isImported");
    t.nonNull.string("address");
    t.nonNull.string("organiser");
    t.json("description");
    t.nonNull.json("owner");
    t.json("terms");
    t.json("primaryTerms");
    t.json("dates");
    t.json("locations");
    t.json("heroImage");
  },
});

export const EventMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("eventCreate", {
      type: "Event",

      args: {
        data: nonNull("EventUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "eventCreate"),

      async resolve(...[, args]) {
        const event = await daoEventCreate(args.data);

        if (!event)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return event;
      },
    });

    t.nonNull.field("eventUpdate", {
      type: "Event",

      args: {
        id: nonNull(intArg()),
        data: nonNull("EventUpsertInput"),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "eventUpdateOwn")) return false;

        if (apiUserCan(ctx, "eventUpdate")) return true;

        const count = await daoEventQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const event = await eventUpdate(args.id, args.data);

        if (!event)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return event;
      },
    });

    t.nonNull.field("eventDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "eventDeleteOwn")) return false;

        if (apiUserCan(ctx, "eventDelete")) return true;

        const count = await daoEventQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const event = await daoEventDelete(args.id);

        if (!event)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
