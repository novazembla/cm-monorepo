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
  daoTourStopsQuery,
  daoTourStopQuery,
  daoTourStopCreate,
  daoTourStopUpdate,
  daoTourStopDelete,
  daoTourStopsQueryCount,
  daoImageSaveImageTranslations,
} from "../../dao";

const apiConfig = getApiConfig();

export const TourStop = objectType({
  name: "TourStop",
  definition(t) {
    t.nonNull.int("id");
    t.int("tourId");
    t.json("title");
    t.json("slug");
    t.int("number");

    t.nonNull.json("teaser");
    t.nonNull.json("description");

    t.field("heroImage", {
      type: "Image",
    });

    t.date("createdAt");
    t.date("updatedAt");
    t.field("tour", {
      type: "Tour",
    });
  },
});

export const TourStopQueryResult = objectType({
  name: "TourStopQueryResult",

  description: dedent`
    List all the available tour stops of the given tour in the database.     
  `,

  definition: (t) => {
    t.int("totalCount");
    t.field("tourStops", { type: list(TourStop) });
  },
});

export const TourStopQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("tourStops", {
      type: "TourStopQueryResult",

      args: {
        tourId: nonNull(intArg()),
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

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let tourStops;

        if ((pRI?.fieldsByTypeName?.TourStopQueryResult as any)?.totalCount) {
          totalCount = await daoTourStopsQueryCount(args.tourId, args.where);

          if (totalCount === 0)
            return {
              totalCount,
              tourStops: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.TourStopQueryResult as any)?.tourStops)
          tourStops = await daoTourStopsQuery(
            args.tourId,
            args.where,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          tourStops,
        };
      },
    });

    t.nonNull.field("tourStopRead", {
      type: "TourStop",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let include = {};

        if ((pRI?.fieldsByTypeName?.TourStop as any)?.tour) {
          include = {
            tour: true,
          };
        }

        return daoTourStopQuery({ id: args.id }, include);
      },
    });
  },
});

export const TourStopCreateInput = inputObjectType({
  name: "TourStopCreateInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.int("tourId");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.int("locationId");
    t.nonNull.json("owner");
  },
});

export const TourStopUpdateInput = inputObjectType({
  name: "TourStopUpdateInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.int("tourId");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.int("locationId");
    t.nonNull.json("owner");
    t.json("heroImage");
  },
});

export const TourStopMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("tourStopCreate", {
      type: "TourStop",

      args: {
        data: nonNull("TourStopCreateInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourCreate"),

      async resolve(...[, args]) {
        const tourStop = await daoTourStopCreate({
          ...args.data,
          tour: {
            connect: { id: args.data.tourId },
          },
        });

        if (!tourStop)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return tourStop;
      },
    });

    t.nonNull.field("tourStopUpdate", {
      type: "TourStop",

      args: {
        id: nonNull(intArg()),
        data: nonNull("TourStopUpdateInput"),
        imagesTranslations: list(arg({ type: "ImageTranslationInput" })),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourUpdate"),

      async resolve(...[, args]) {
        const tourStop = await daoTourStopUpdate(args.id, args.data);

        if (!tourStop)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        if (Array.isArray(args.imagesTranslations))
          await daoImageSaveImageTranslations(args.imagesTranslations);

        return tourStop;
      },
    });

    t.nonNull.field("tourStopDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourDelete"),

      async resolve(...[, args]) {
        const tourStop = await daoTourStopDelete(args.id);

        if (!tourStop)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "TourStop deletion failed"
          );

        return { result: true };
      },
    });
  },
});
