/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { filteredOutputByWhitelist } from "@culturemap/core";

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

import config from "../../config";

import {
  daoLocationQuery,
  daoLocationQueryCount,
  daoLocationGetById,
  daoLocationCreate,
  daoLocationUpdate,
  daoLocationDelete,
  daoUserGetById,
} from "../../dao";

export const Location = objectType({
  name: "Location",
  definition(t) {
    t.nonNull.int("id");
    t.json("title");
    t.json("slug");

    t.nonNull.int("ownerId");
    t.nonNull.int("status");
    t.field("author", {
      type: "User",

      // resolve(root, args, ctx, info)
      async resolve(...[p]) {
        if (p.ownerId) {
          const user = await daoUserGetById(p.ownerId);
          if (user)
            return filteredOutputByWhitelist(user, [
              "id",
              "firstName",
              "lastName",
            ]);
        }
        return null;
      },
    });

    t.json("description");
    t.json("address");
    t.json("contactInfo");
    t.json("offers");

    t.float("lat");
    t.float("lng");

    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const LocationQueryResult = objectType({
  name: "LocationQueryResult",
  description: dedent`
    List all the locations in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("locations", {
      type: list("Location"),
    });
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
          default: config.db.defaultPageSize,
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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationRead"),

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let locations;

        if ((pRI?.fieldsByTypeName?.LocationQueryResult as any)?.totalCount) {
          totalCount = await daoLocationQueryCount(args.where);

          if (totalCount === 0)
            return {
              totalCount,
              locations: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.LocationQueryResult as any)?.locations)
          locations = await daoLocationQuery(
            args.where,
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

    t.nonNull.field("locationRead", {
      type: "Location",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoLocationGetById(args.id);
      },
    });
  },
});

export const LocationCreateInput = inputObjectType({
  name: "LocationUpsertInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.nonNull.int("status");
    t.json("description");
    t.json("address");
    t.json("contactInfo");
    t.json("offers");
    t.nonNull.int("ownerId");
    t.float("lat");
    t.float("lng");
  },
});

export const LocationMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("locationCreate", {
      type: "Location",

      args: {
        data: nonNull("LocationUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationCreate"),

      async resolve(...[, args]) {
        const location = await daoLocationCreate({
          title: args.data.title,
          slug: args.data.slug,
          description: args.data.description,
          address: args.data.address,
          contactInfo: args.data.contactInfo,
          offers: args.data.offers,
          lat: args.data.lat,
          lng: args.data.lng,
          status: args.data.status,
          owner: {
            connect: { id: args.data.ownerId },
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

    t.nonNull.field("locationUpdate", {
      type: "Location",

      args: {
        id: nonNull(intArg()),
        data: nonNull("LocationUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationUpdate"),

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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "locationDelete"),

      async resolve(...[, args]) {
        const location = await daoLocationDelete(args.id);

        if (!location)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
