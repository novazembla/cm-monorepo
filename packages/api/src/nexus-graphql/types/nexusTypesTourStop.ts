/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { Prisma } from ".prisma/client";

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
import lodash from "lodash";

import { ApiError } from "../../utils";

import { authorizeApiUser } from "../helpers";

import {
  daoTourStopQuery,
  daoTourStopCreate,
  daoTourStopUpdate,
  daoTourStopDelete,
  daoImageSaveImageTranslations,
  daoTourGetById,
} from "../../dao";

const { pick } = lodash;

export const TourStop = objectType({
  name: "TourStop",
  definition(t) {
    t.nonNull.int("id");
    t.int("tourId");
    t.int("locationId");
    t.json("title");
    t.int("number");
    t.int("location");

    t.nonNull.json("teaser");
    t.nonNull.json("description");

    t.field("heroImage", {
      type: "Image",
    });

    t.field("location", {
      type: "Location",
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
        let where: Prisma.TourStopWhereInput = {
          id: args.id,
        };

        if ((pRI?.fieldsByTypeName?.TourStop as any)?.tour) {
          include = {
            tour: true,
          };
        }

        if ((pRI?.fieldsByTypeName?.TourStop as any)?.location) {
          include = {
            ...include,
            location: {
              select: {
                id: true,
                title: true,
              },
            },
          };
        }

        if ((pRI?.fieldsByTypeName?.TourStop as any)?.heroImage) {
          include = {
            ...include,
            heroImage: {
              select: {
                id: true,
                meta: true,
                status: true,
                translations: true,
              },
            },
          };
          // TODO: fix that
          // where = {
          //   ...where,
          //   OR: [
          //     {
          //       heroImage: {
          //         status: {
          //           not: {
          //             in: [
          //               ImageStatus.ERROR,
          //               ImageStatus.DELETED,
          //               ImageStatus.TRASHED,
          //             ],
          //           },
          //         },
          //       },
          //     },
          //     {
          //       heroImage: null,
          //     },
          //   ],
          // };
        }

        return daoTourStopQuery(
          where,
          Object.keys(include).length > 0 ? include : undefined
        );
      },
    });
  },
});

export const TourStopCreateInput = inputObjectType({
  name: "TourStopCreateInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.int("tourId");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.int("locationId");
  },
});

export const TourStopUpdateInput = inputObjectType({
  name: "TourStopUpdateInput",
  definition(t) {
    t.nonNull.json("title");
    t.int("tourId");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.int("locationId");
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
        const tour = await daoTourGetById(args.data.tourId);
        if (!tour)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        const connect = {
          tour: {
            connect: { id: args.data.tourId },
          },
          location: {
            connect: { id: args.data.locationId },
          },
          owner: {
            connect: { id: tour.ownerId },
          },
        };

        const tourStop = await daoTourStopCreate({
          ...pick(args.data, ["title", "teaser", "description"]),
          ...connect,
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
        const connect = {
          location: {
            connect: { id: args.data.locationId },
          },
        };

        const tourStop = await daoTourStopUpdate(args.id, {
          ...pick(args.data, ["title", "teaser", "description", "heroImage"]),
          ...connect,
        });

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
