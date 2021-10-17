/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { Prisma } from ".prisma/client";
import { PublishStatus } from "@culturemap/core";

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  // stringArg,
  intArg,
  list,
} from "nexus";
import httpStatus from "http-status";
import lodash from "lodash";

import { ApiError } from "../../utils";

import { authorizeApiUser, apiUserCan } from "../helpers";

import {
  daoTourStopQuery,
  daoTourStopCreate,
  daoTourStopUpdate,
  daoTourStopDelete,
  daoTourGetById,
  daoTourStopQueryCount,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoSharedGetTranslatedSelectColumns,
} from "../../dao";

const { pick } = lodash;

export const TourStop = objectType({
  name: "TourStop",
  definition(t) {
    t.nonNull.int("id");
    t.int("tourId");
    t.int("locationId");
    t.int("number");
    t.int("location");

    t.json("title", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "title"),
    });

    t.json("teaser", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "teaser"),
    });

    t.json("description", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "description"),
    });

    t.field("heroImage", {
      type: "Image",
    });

    t.list.field("images", {
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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourReadOwn", true),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let include = {};
        let where: Prisma.TourStopWhereInput = {
          id: args.id,
        };

        // here needs to be the preview access bypass TODO:
        if (!apiUserCan(ctx, "tourReadOwn")) {
          where = {
            ...where,
            tour: {
              status: PublishStatus.PUBLISHED,
            },
          };
        } else {
          if (!apiUserCan(ctx, "tourRead")) {
            where = {
              ...where,
              tour: {
                owner: {
                  id: ctx?.apiUser?.id ?? 0,
                },
              },
            };
          }
        }

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
                ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
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
                status: true,
                meta: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
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

        if ((pRI?.fieldsByTypeName?.TourStop as any)?.images) {
          include = {
            ...include,
            images: {
              select: {
                id: true,
                status: true,
                meta: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
            },
          };
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
    t.json("images");
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
    t.json("images");
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

      authorize: async (...[, , ctx]) => {
        if (!authorizeApiUser(ctx, "tourUpdateOwn")) return false;

        if (apiUserCan(ctx, "tourUpdate")) return true;

        const count = await daoTourStopQueryCount({
          tour: {
            owner: {
              id: ctx.apiUser?.id ?? 0,
            },
          },
        });

        return count === 1;
      },

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
      },

      authorize: async (...[, , ctx]) => {
        if (!authorizeApiUser(ctx, "tourUpdateOwn")) return false;

        if (apiUserCan(ctx, "tourUpdate")) return true;

        const count = await daoTourStopQueryCount({
          tour: {
            owner: {
              id: ctx.apiUser?.id ?? 0,
            },
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const connect = {
          location: {
            connect: { id: args.data.locationId },
          },
        };

        const tourStop = await daoTourStopUpdate(args.id, {
          ...pick(args.data, [
            "title",
            "teaser",
            "description",
            "heroImage",
            "images",
          ]),
          ...connect,
        });

        if (!tourStop)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return tourStop;
      },
    });

    t.nonNull.field("tourStopDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: async (...[, , ctx]) => {
        if (!authorizeApiUser(ctx, "tourDeleteOwn")) return false;

        if (apiUserCan(ctx, "tourDelete")) return true;

        const count = await daoTourStopQueryCount({
          tour: {
            owner: {
              id: ctx.apiUser?.id ?? 0,
            },
          },
        });

        return count === 1;
      },

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
