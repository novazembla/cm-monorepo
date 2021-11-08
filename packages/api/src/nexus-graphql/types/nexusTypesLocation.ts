/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { PublishStatus } from "@culturemap/core";

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
import { Prisma } from "@prisma/client";

import httpStatus from "http-status";
import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser, apiUserCan } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoLocationQuery,
  daoLocationSelectQuery,
  daoLocationQueryCount,
  daoLocationQueryFirst,
  daoLocationCreate,
  daoLocationUpdate,
  daoLocationDelete,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoSharedGetTranslatedSelectColumns,
} from "../../dao";

import {
  locationSuggestionCreate
} from "../../services/serviceLocation";

const apiConfig = getApiConfig();

export const Location = objectType({
  name: "Location",
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
    t.json("offers", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "offers"),
    });
    t.json("accessibilityInformation", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "accessibilityInformation"),
    });

    t.nonNull.int("ownerId");
    t.nonNull.int("status");

    // TODO: enable ... Show form fields and such fun ...
    // Add tracker ..
    t.date("visibleFrom");
    t.date("visibleFromTime");

    t.date("visibleUntil");
    t.date("visibleUntilTime");

    t.json("address");
    t.json("contactInfo");
    t.json("geoCodingInfo");
    t.json("socialMedia");
    t.json("meta", {
      resolve: (...[p, args, ctx]) => {
        if (!apiUserCan(ctx, "locationReadOwn")) return null;
        return p?.meta;
      }        
    });
    t.int("eventLocationId");
    t.string("agency");
    t.field("heroImage", {
      type: "Image",
    });

    t.list.field("images", {
      type: "Image",
    });

    t.list.field("terms", {
      type: "Term",
    });

    t.list.field("primaryTerms", {
      type: "Term",
    });

    t.list.field("events", {
      type: "Event",
    });

    t.float("lat");
    t.float("lng");

    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const LocationQueryResult = objectType({
  name: "LocationQueryResult",
  description: dedent`
    Query all the locations in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("locations", {
      type: list("Location"),
    });
  },
});

export const LocationIDsQueryResult = objectType({
  name: "LocationIDsQueryResult",
  description: dedent`
    Query the ids of all the locations in the database.     
  `,
  definition: (t) => {
    t.list.int("ids");
  },
});

export const LocationQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("locations", {
      type: LocationQueryResult,

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

      authorize: (...[, , ctx]) =>
        authorizeApiUser(ctx, "locationReadOwn", true),

      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let locations;
        let include: Prisma.LocationInclude = {};
        let where: Prisma.LocationWhereInput = args.where;

        if (!apiUserCan(ctx, "locationReadOwn")) {
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
          if (!apiUserCan(ctx, "locationRead")) {
            where = {
              ...where,
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            };
          }
        }

        if ((pRI?.fieldsByTypeName?.LocationQueryResult as any)?.totalCount) {
          totalCount = await daoLocationQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              locations: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.LocationQueryResult as any)?.locations
            ?.fieldsByTypeName?.Location?.terms
        ) {
          include = {
            ...include,
            terms: {
              select: {
                id: true,
                taxonomyId: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              },
            },
          };
        }

        if (
          (pRI?.fieldsByTypeName?.LocationQueryResult as any)?.locations
            ?.fieldsByTypeName?.Location?.primaryTerms
        ) {
          include = {
            ...include,
            primaryTerms: {
              select: {
                id: true,
                taxonomyId: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              },
            },
          };
        }

        if (
          (pRI?.fieldsByTypeName?.LocationQueryResult as any)?.locations
            ?.fieldsByTypeName?.Location?.heroImage
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
        }

        if ((pRI?.fieldsByTypeName?.LocationQueryResult as any)?.locations)
          locations = await daoLocationQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          locations,
        };
      },
    });

    t.field("locationIds", {
      type: LocationIDsQueryResult,

      args: {
        where: arg({
          type: GQLJson,
          default: undefined,
        }),
      },

      authorize: (...[, , ctx]) =>
        authorizeApiUser(ctx, "locationReadOwn", true),

      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let where: Prisma.LocationWhereInput = args.where;

        if (!apiUserCan(ctx, "locationReadOwn")) {
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
          if (!apiUserCan(ctx, "locationRead")) {
            where = {
              ...where,
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            };
          }
        }

        const ids = await daoLocationSelectQuery(
            where,
            {
              id: true
            }    
          );

        return {
          ids: ids?.length ? ids.map((l) => l.id) : [],
        };
      },
    });

    t.nonNull.field("location", {
      type: "Location",

      args: {
        slug: stringArg(),
        id: intArg(),
      },

      authorize: (...[, , ctx]) =>
        authorizeApiUser(ctx, "locationReadOwn", true),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const config = getApiConfig();
        const pRI = parseResolveInfo(info);

        let where: Prisma.LocationWhereInput[] = [];
        let include: Prisma.LocationInclude = {};

        if ((pRI?.fieldsByTypeName?.Location as any)?.terms)
          include = {
            ...include,
            terms: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
                taxonomyId: true,
              },
            },
            primaryTerms: {
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
                taxonomyId: true,
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.Location as any)?.events)
          include = {
            ...include,
            events: {
              ...(!apiUserCan(ctx, "locationReadOwn")
                ? {
                    where: {
                      status: PublishStatus.PUBLISHED,
                      lastEventDate: {
                        gt: new Date(new Date().setHours(0, 0, 0, 0)),
                      },
                    },
                  }
                : {
                    where: {
                      lastEventDate: {
                        gt: new Date(new Date().setHours(0, 0, 0, 0)),
                      },
                    },
                  }),
              select: {
                id: true,
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "slug",
                  "description",
                ]),
                firstEventDate: true,
                lastEventDate: true,
                dates: {
                  select: {
                    date: true,
                    begin: true,
                    end: true,
                  },
                  orderBy: {
                    date: "asc",
                  },
                  take: 3,
                },
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                    ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
                  },
                },
              },
            },
          };

        if ((pRI?.fieldsByTypeName?.Location as any)?.heroImage)
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

        if ((pRI?.fieldsByTypeName?.Location as any)?.images)
          include = {
            ...include,
            images: {
              select: {
                id: true,
                status: true,
                meta: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
              orderBy: {
                orderNumber: "asc",
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

        if (args.id) {
          where.push({
            id: args.id,
          });
        }

        if (!apiUserCan(ctx, "locationReadOwn")) {
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
          if (!apiUserCan(ctx, "locationRead")) {
            where.push({
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            });
          }
        }

        if (Object.keys(where).length > 0) {
          return daoLocationQueryFirst(
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

export const LocationUpsertInput = inputObjectType({
  name: "LocationUpsertInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.int("status");
    t.json("description");
    t.json("address");
    t.json("geoCodingInfo");
    t.json("contactInfo");
    t.json("accessibilityInformation");
    t.json("socialMedia");
    t.json("offers");
    t.int("eventLocationId");
    t.string("agency");
    t.nonNull.json("owner");
    t.float("lat");
    t.float("lng");
    t.json("terms");
    t.json("primaryTerms");
    t.json("heroImage");
    t.json("images");
  },
});

export const LocationSuggestionInput = inputObjectType({
  name: "LocationSuggestionInput",
  definition(t) {
    t.nonNull.json("title");
    t.json("description");
    t.json("address");
    t.json("contactInfo");
    t.json("accessibilityInformation");
    t.json("socialMedia");
    t.json("offers");
    t.json("terms");
    t.json("heroImage");
    t.json("meta");
  },
});

export const LocationMutations = extendType({
  type: "Mutation",

  definition(t) {

    t.nonNull.field("suggestion", {
      type: "Location",

      args: {
        data: nonNull("LocationSuggestionInput"),
      },

      async resolve(...[, args]) {
        const location = await locationSuggestionCreate(args.data);

        if (!location)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return location;
      },
    });

    t.nonNull.field("locationCreate", {
      type: "Location",

      args: {
        data: nonNull("LocationUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args]) {
        const location = await daoLocationCreate(args.data);

        if (!location)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return location;
      },
    });

    t.nonNull.field("locationUpdate", {
      type: "Location",

      args: {
        id: nonNull(intArg()),
        data: nonNull("LocationUpsertInput"),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "locationUpdateOwn")) return false;

        if (apiUserCan(ctx, "locationUpdate")) return true;

        const count = await daoLocationQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const location = await daoLocationUpdate(args.id, args.data);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return location;
      },
    });

    t.nonNull.field("locationDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "locationDeleteOwn")) return false;

        if (apiUserCan(ctx, "locationDelete")) return true;

        const count = await daoLocationQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const location = await daoLocationDelete(args.id);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
