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

import { getApiConfig } from "../../config";

import {
  daoTourQuery,
  daoTourQueryCount,
  daoTourQueryFirst,
  // daoTourGetTourStops,
  daoTourCreate,
  daoTourUpdate,
  daoTourDelete,
} from "../../dao";

const apiConfig = getApiConfig();

export const Tour = objectType({
  name: "Tour",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.string("duration");
    t.nonNull.string("distance");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.json("path");
    t.json("heroImage");
    t.nonNull.int("status");
    //t.int("tourStopCount"); // TODO: implement
    t.date("createdAt");
    t.date("updatedAt");
    t.int("termCount", {
      resolve(...[parent]) {
        return (parent as any)?._count?.terms ?? 0;
      },
    });

    t.field("tourStops", {
      type: list("TourStop"),

      // authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourRead"),

      // async resolve(...[parent]) {
      //   return daoTourGetTourStops(parent.id);
      // },
    });

    t.list.field("modules", {
      type: "Module",
    });
  },
});

export const TourQueryResult = objectType({
  name: "TourQueryResult",
  description: dedent`
    List all the tours in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("tours", {
      type: list("Tour"),
    });
  },
});

export const TourQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("tours", {
      type: TourQueryResult,

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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourRead"),

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let tours;
        let include = {};
        if ((pRI?.fieldsByTypeName?.TourQueryResult as any)?.totalCount) {
          totalCount = await daoTourQueryCount(args.where);

          if (totalCount === 0)
            return {
              totalCount,
              tours: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.TourQueryResult as any)?.tours
            ?.fieldsByTypeName?.Tour?.termCount
        )
          include = {
            ...include,
            _count: {
              select: {
                terms: true,
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.TourQueryResult as any)?.tours)
          tours = await daoTourQuery(
            args.where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        // countStops
        // t.field("tourStops", {
        //   type: list("TourStop"),

        //   // authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourRead"),

        //   // async resolve(...[parent]) {
        //   //   return daoTourGetTourStops(parent.id);
        //   // },
        // });

        return {
          totalCount,
          tours,
        };
      },
    });

    t.nonNull.field("tourRead", {
      type: "Tour",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let include = {};

        if ((pRI?.fieldsByTypeName?.Tour as any)?.modules) {
          include = {
            ...include,
            modules: true,
          };
        }

        // t.field("tourStops", {
        //   type: list("TourStop"),

        //   // authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourRead"),

        //   // async resolve(...[parent]) {
        //   //   return daoTourGetTourStops(parent.id);
        //   // },
        // });

        const tour = await daoTourQueryFirst(
          {
            id: args.id,
          },
          Object.keys(include).length > 0 ? include : undefined
        );

        return tour;
      },
    });
  },
});

export const TourUpsertInput = inputObjectType({
  name: "TourUpsertInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.string("duration");
    t.nonNull.string("distance");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.json("path");
    t.json("heroImage");
    t.nonNull.json("owner");
    t.nonNull.int("status");
  },
});

export const TourMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("tourCreate", {
      type: "Tour",

      args: {
        data: nonNull("TourUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourCreate"),

      async resolve(...[, args]) {
        const tour = await daoTourCreate(args.data);

        if (!tour)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return tour;
      },
    });

    t.nonNull.field("tourUpdate", {
      type: "Tour",

      args: {
        id: nonNull(intArg()),
        data: nonNull("TourUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourUpdate"),

      async resolve(...[, args]) {
        const tour = await daoTourUpdate(args.id, args.data);

        if (!tour)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return tour;
      },
    });

    t.nonNull.field("tourDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourDelete"),

      async resolve(...[, args]) {
        const tour = await daoTourDelete(args.id);

        if (!tour)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
