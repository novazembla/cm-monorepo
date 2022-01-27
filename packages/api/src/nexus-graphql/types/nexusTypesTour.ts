/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { PublishStatus } from "@culturemap/core";
import { Prisma } from ".prisma/client";

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
  daoTourQuery,
  daoTourQueryCount,
  daoTourQueryFirst,
  daoTourGetById,
  // daoTourGetTourStops,
  daoTourCreate,
  daoTourUpdate,
  daoTourDelete,
  daoTourStopReorder,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoSharedGetTranslatedSelectColumns,
} from "../../dao";

const apiConfig = getApiConfig();

export const Tour = objectType({
  name: "Tour",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("ownerId");
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.json("teaser");
    t.nonNull.json("description");

    t.json("title", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "title"),
    });

    t.json("slug", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "slug"),
    });
    t.json("teaser", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "teaser"),
    });

    t.json("description", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "description"),
    });

    t.json("duration", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "duration"),
    });

    t.json("distance", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "distance"),
    });

    t.nonNull.json("path");
    t.field("heroImage", {
      type: "Image",
    });
    t.nonNull.int("status");
    t.date("createdAt");
    t.date("updatedAt");
    t.int("orderNumber");
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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourReadOwn", true),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let tours;
        let include: Prisma.TourInclude = {};
        let where: Prisma.TourWhereInput = args.where;

        if (!apiUserCan(ctx, "tourReadOwn")) {
          where = {
            ...where,
            status: PublishStatus.PUBLISHED,
          };
        } else {
          if (!apiUserCan(ctx, "canAccessTrash")) {
            where = {
              ...where,
              status: {
                not: { in: [PublishStatus.TRASHED, PublishStatus.DELETED] },
              },
            };
          }
          if (!apiUserCan(ctx, "tourRead")) {
            where = {
              ...where,
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            };
          }
        }

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
                status: true,
                meta: true,
                cropPosition: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
            },
          };

          // // TODO: get this where running
          // where = {
          //   ...where,
          //   heroImage: {
          //     status: {
          //       not: {
          //         in: [
          //           ImageStatus.ERROR,
          //           ImageStatus.DELETED,
          //           ImageStatus.TRASHED,
          //         ],
          //       },
          //     },
          //   },
          //};
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
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "teaser",
                  "description",
                ]),

                number: true,
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                    ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
                  },
                },
                location: {
                  select: {
                    id: true,
                    ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
                    lat: true,
                    lng: true,
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

    t.nonNull.field("tour", {
      type: "Tour",

      args: {
        slug: stringArg(),
        id: intArg(),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "tourReadOwn", true),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const config = getApiConfig();
        const pRI = parseResolveInfo(info);

        let include = {};
        let where: Prisma.TourWhereInput[] = [];

        if ((pRI?.fieldsByTypeName?.Tour as any)?.tourStops) {
          include = {
            ...include,
            tourStops: {
              select: {
                id: true,
                number: true,
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "teaser",
                  "description",
                ]),
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                    ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
                  },
                },
                images: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                    ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
                  },
                },
                location: {
                  select: {
                    id: true,
                    status: true,
                    ...daoSharedGetTranslatedSelectColumns([
                      "title",
                      "slug",
                      "description",
                    ]),
                    lat: true,
                    lng: true,
                    terms: {
                      select: {
                        id: true,
                        taxonomyId: true,
                        color: true,
                        colorDark: true,
                        ...daoSharedGetTranslatedSelectColumns([
                          "name",
                          "slug",
                        ]),
                      },
                    },
                    primaryTerms: {
                      select: {
                        id: true,
                        ...daoSharedGetTranslatedSelectColumns([
                          "name",
                          "slug",
                        ]),
                      },
                    },
                    heroImage: {
                      select: {
                        id: true,
                        status: true,
                        meta: true,
                        cropPosition: true,
                        ...daoSharedGetTranslatedSelectColumns([
                          "alt",
                          "credits",
                        ]),
                      },
                    },
                  },
                  where: {
                    status: !apiUserCan(ctx, "tourReadOwn")
                      ? PublishStatus.PUBLISHED
                      : undefined,
                  },
                },
              },
              orderBy: {
                number: "asc",
              },
            },
          };
          // TODO: get this where running
          // TODO: Filter data
          // where = {
          //   ...where,
          //   OR: [
          //     {
          //       tourStops: {
          //         heroImage: {
          //           status: {
          //             not: {
          //               in: [
          //                 ImageStatus.ERROR,
          //                 ImageStatus.DELETED,
          //                 ImageStatus.TRASHED,
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
                status: true,
                meta: true,
                cropPosition: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
            },
          };
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

        if (args.slug && args.slug.trim() !== "") {
          where.push({
            OR: config?.activeLanguages.map((lang) => ({
              [`slug_${lang}`]: args.slug,
            })),
          });
        }

        if (args.id) {
          where.push({
            id: args.id,
          });
        }

        if (!apiUserCan(ctx, "tourReadOwn")) {
          where.push({
            status: PublishStatus.PUBLISHED,
          });
        } else {
          if (!apiUserCan(ctx, "canAccessTrash")) {
            where.push({
              status: {
                not: { in: [PublishStatus.TRASHED, PublishStatus.DELETED] },
              },
            });
          }
          if (!apiUserCan(ctx, "tourRead")) {
            where.push({
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            });
          }
        }

        const tour = await daoTourQueryFirst(
          where.length > 1 ? { AND: where } : where.shift() ?? {},
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
    t.nonNull.int("orderNumber");
  },
});

export const TourStopOrderInput = inputObjectType({
  name: "TourStopOrderInput",
  definition(t) {
    t.int("id");
    t.int("number");
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

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "tourUpdateOwn")) return false;

        if (apiUserCan(ctx, "tourUpdate")) return true;

        const count = await daoTourQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const tour = await daoTourUpdate(args.id, args.data);

        if (!tour)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return tour;
      },
    });

    t.nonNull.field("tourReorderTourStops", {
      type: "Tour",

      args: {
        id: nonNull(intArg()),
        data: nonNull(list("TourStopOrderInput")),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "tourUpdateOwn")) return false;

        if (apiUserCan(ctx, "tourUpdate")) return true;

        const count = await daoTourQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const currentTour = await daoTourGetById(args.id);

        if (!currentTour || !Array.isArray(args.data) || args.data.length <= 1)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        const count = await daoTourStopReorder(args.id, args.data);

        if (count !== args.data.length)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return currentTour;
      },
    });

    t.nonNull.field("tourDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "tourDeleteOwn")) return false;

        if (apiUserCan(ctx, "tourDelete")) return true;

        const count = await daoTourQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const tour = await daoTourDelete(args.id);

        if (!tour)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
