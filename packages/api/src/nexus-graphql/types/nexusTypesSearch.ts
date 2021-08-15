/// <reference path="../../types/nexus-typegen.ts" />
import Prisma from "@prisma/client";
import {
  objectType,
  extendType,
  nonNull,
  stringArg,
  intArg,
  list,
} from "nexus";

// import httpStatus from "http-status";
// import { ApiError } from "../../utils";

// import { authorizeApiUser } from "../helpers";
// import config from "../../config";

import {
  daoLocationSearchQuery,
  // daoImageQuery,
  // daoImageCreate,
  // daoImageQueryCount,
} from "../../dao";

export const SearchResultItem = objectType({
  name: "SearchResultItem",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("type");
    t.nonNull.json("title");
    t.nonNull.json("excerpt");
    t.nonNull.json("slug");

    t.field("geopoint", {
      type: "GeoPoint",
    });
  },
});

export const SearchResult = objectType({
  name: "SearchResult",
  definition(t) {
    t.nonNull.string("module");
    t.nonNull.int("totalCount");
    t.list.field("items", {
      type: "SearchResultItem",
    });
  },
});

export const SearchQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("quickSearch", {
      type: list("SearchResult"),

      args: {
        search: nonNull(stringArg()),
        termIds: list(intArg()),
        modules: list(stringArg()),
      },

      async resolve(...[, args, , info]) {
        const parsedQuery = args.search.trim().split(" ");
        const result = [];

        const query =
          parsedQuery.length === 1
            ? {
                contains: parsedQuery[0],
                mode: "insensitive" as any,
              }
            : {
                OR: parsedQuery.map((contains) => ({
                  contains,
                  mode: "insensitive" as any,
                })),
              };

        const locations = await daoLocationSearchQuery({
          fullText: query,
        });

        if (locations && locations.length > 0) {
          const items = locations.map((loc) => ({
            id: loc.id,
            type: "location",
            title: loc.title,
            excerpt: loc.description,
            slug: loc.slug,
            geopoint: {
              lng: loc.lng,
              lat: loc.lat,
            },
          }));

          result.push({
            module: "location",
            items,
            totalCount: items.length,
          });
        }

        return result;
      },
    });
  },
});
