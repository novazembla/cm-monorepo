/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { PublishStatus, ImageStatusEnum } from "@culturemap/core";

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

import { authorizeApiUser, apiUserCan } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoTourQuery,
  daoTourQueryCount,
  daoTourQueryFirst,
  // daoTourGetTourStops,
  daoTourCreate,
  daoTourUpdate,
  daoTourDelete,
  daoImageSaveImageTranslations,
} from "../../dao";
import { Prisma } from ".prisma/client";

const apiConfig = getApiConfig();

export const Tour = objectType({
  name: "Tour",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("ownerId");
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.json("duration");
    t.nonNull.json("distance");
    t.nonNull.json("teaser");
    t.nonNull.json("description");
    t.nonNull.json("path");
    t.field("heroImage", {
      type: "Image",
    });
    t.nonNull.int("status");
    t.date("createdAt");
    t.date("updatedAt");
    t.int("tourStopCount", {
      resolve(...[parent]) {
        return (parent as any)?._count?.tourStops ?? 0;
      },
    });
    t.field("tourStops", {
      type: list("TourStop"),
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

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let tours;
        let include = {};

        let where: Prisma.TourWhereInput = args.where ?? {};
        if (!apiUserCan(ctx, "tourRead"))
          where = {
            ...where,
            status: PublishStatus.PUBLISHED,
          };

        if ((pRI?.fieldsByTypeName?.TourQueryResult as any)?.totalCount) {
          totalCount = await daoTourQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              tours: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.TourQueryResult as any)?.tours
            ?.fieldsByTypeName?.Tour?.tourStopCount
        )
          include = {
            ...include,
            _count: {
              select: {
                tourStops: true,
              },
            },
          };

        if (
          (pRI?.fieldsByTypeName?.TourQueryResult as any)?.tours
            ?.fieldsByTypeName?.Tour?.heroImage
        ) {
          include = {
            ...include,
            heroImage: {
              select: {
                id: true,
                meta: true,
                status: true,
              },
            },
          };
          where = {
            ...where,
            heroImage: {
              status: {
                not: {
                  in: [
                    ImageStatusEnum.ERROR,
                    ImageStatusEnum.DELETED,
                    ImageStatusEnum.TRASHED,
                  ],
                },
              },
            },
          };
        }

        if (
          (pRI?.fieldsByTypeName?.TourQueryResult as any)?.tours
            ?.fieldsByTypeName?.Tour?.tourStops
        )
          include = {
            ...include,
            tourStops: {
              select: {
                id: true,
                title: true,
                number: true,
                teaser: true,
                description: true,
                heroImage: {
                  select: {
                    id: true,
                    meta: true,
                    status: true,
                  },
                },
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.TourQueryResult as any)?.tours)
          tours = await daoTourQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

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

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let include = {};
        let where: Prisma.TourWhereInput = {
          id: args.id,
        };

        if (!apiUserCan(ctx, "tourRead"))
          where = {
            ...where,
            status: PublishStatus.PUBLISHED,
          };

        if ((pRI?.fieldsByTypeName?.Tour as any)?.tourStops) {
          include = {
            ...include,
            tourStops: {
              select: {
                id: true,
                title: true,
                number: true,
                teaser: true,
                description: true,
                heroImage: {
                  select: {
                    id: true,
                    meta: true,
                    status: true,
                    translations: true,
                  },
                },
              },
            },
          };
          // TODO get this where running
          // where = {
          //   ...where,
          //   OR: [
          //     {
          //       tourStops: {
          //         heroImage: {
          //           status: {
          //             not: {
          //               in: [
          //                 ImageStatusEnum.ERROR,
          //                 ImageStatusEnum.DELETED,
          //                 ImageStatusEnum.TRASHED,
          //               ],
          //             },
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

        if ((pRI?.fieldsByTypeName?.Tour as any)?.heroImage) {
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
          where = {
            ...where,
            OR: [
              {
                heroImage: {
                  status: {
                    not: {
                      in: [
                        ImageStatusEnum.ERROR,
                        ImageStatusEnum.DELETED,
                        ImageStatusEnum.TRASHED,
                      ],
                    },
                  },
                },
              },
              {
                heroImage: null,
              },
            ],
          };
        }

        const tour = await daoTourQueryFirst(
          where,
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
    t.nonNull.json("duration");
    t.nonNull.json("distance");
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
        imagesTranslations: list(arg({ type: "ImageTranslationInput" })),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourUpdate"),

      async resolve(...[, args]) {
        const tour = await daoTourUpdate(args.id, args.data);

        if (!tour)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        if (Array.isArray(args.imagesTranslations))
          await daoImageSaveImageTranslations(args.imagesTranslations);

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
