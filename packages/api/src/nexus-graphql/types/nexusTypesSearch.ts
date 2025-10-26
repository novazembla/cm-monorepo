/// <reference path="../../types/nexus-typegen.ts" />
import {
  extendType,
  intArg,
  list,
  nonNull,
  objectType,
  stringArg,
} from "nexus";

import type { NexusGenObjects } from "../../types/nexus-typegen";

// import httpStatus from "http-status";
// import { ApiError } from "../../utils";

// import { authorizeApiUser } from "../helpers";

import {
  daoEventSelectQuery,
  daoLocationSelectQuery,
  daoPageSelectQuery,
  daoSharedGetTranslatedSelectColumns,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoTourSelectQuery,
} from "../../dao";
// import { PublishStatus, ImageStatus } from "@culturemap/core";
import { PublishStatus } from "@culturemap/core";

import { htmlToTrimmedString } from "../../utils";
// import { getSettings } from "../../services/serviceSetting";

const descriptionMaxLength = 300;

const asTrimmedText = (val: any) => {
  return htmlToTrimmedString(val, descriptionMaxLength, true);
};

export const SearchResultItem = objectType({
  name: "SearchResultItem",

  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("type");
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.json("excerpt");
    t.int("countTourStops");
    t.list.field("dates", {
      type: "EventDate",
    });
    t.list.field("locations", {
      type: "Location",
    });
    t.list.field("terms", {
      type: "Term",
    });
    t.list.field("primaryTerms", {
      type: "Term",
    });
    t.field("geopoint", {
      type: "GeoPoint",
    });
    t.field("heroImage", {
      type: "Image",
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
        lang: nonNull(stringArg()),
        termIds: list(intArg()),
        modules: list(stringArg()),
      },

      async resolve(...[, args]) {
        const parsedQuery = args.search.trim().split(" ");
        const modules = args.modules ?? [];
        const result: NexusGenObjects["SearchResult"][] = [];

        console.log("Modules", modules);
        const query =
          parsedQuery.length === 1
            ? {
                fullText: {
                  contains: parsedQuery[0],
                  mode: "insensitive" as any,
                },
              }
            : {
                OR: parsedQuery.map((contains) => ({
                  fullText: {
                    contains,
                    mode: "insensitive" as any,
                  },
                })),
              };
        if (modules.includes("location")) {
          console.log("module", "location");
          const locations = await daoLocationSelectQuery(
            {
              status: PublishStatus.PUBLISHED,
              ...query,
            },
            {
              id: true,
              ...daoSharedGetTranslatedSelectColumns([
                "title",
                "slug",
                // "description",
              ]),
              lat: true,
              lng: true,
              // primaryTerms: {
              //   select: {
              //     id: true,
              //     ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              //     color: true,
              //     colorDark: true,
              //   },
              //   take: 1,
              //   where: {
              //     taxonomyId: parseInt(
              //       settings?.taxMapping?.typeOfInstitution ?? "0"
              //     ),
              //   },
              // },
              // terms: {
              //   select: {
              //     id: true,
              //     ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
              //     color: true,
              //     colorDark: true,
              //   },
              //   take: 1,
              //   where: {
              //     taxonomyId: parseInt(
              //       settings?.taxMapping?.typeOfInstitution ?? "0"
              //     ),
              //   },
              // },
              // heroImage: {
              //   select: {
              //     id: true,
              //     status: true,
              //     meta: true,
              //     cropPosition: true,
              //   },
              // },
            },
            {
              [`title_${args.lang}`]: "asc",
            },
            0,
            25
          );

          if (locations && locations.length > 0) {
            const items = locations.map((loc: any) => ({
              id: loc.id,
              type: "location",
              title: daoSharedMapTranslatedColumnsInRowToJson(loc, "title"),
              // TODO: howto trim to 200 chars ...
              // excerpt: daoSharedMapTranslatedColumnsInRowToJson(
              //   loc,
              //   "description",
              //   asTrimmedText
              // ),
              slug: daoSharedMapTranslatedColumnsInRowToJson(loc, "slug"),
              geopoint: {
                lng: loc.lng ?? 0,
                lat: loc.lat ?? 0,
              },
              // primaryTerms: loc.primaryTerms,
              // terms: loc.terms,
              // heroImage:
              //   loc?.heroImage?.id && loc?.heroImage?.status === ImageStatus.READY
              //     ? loc?.heroImage
              //     : undefined,
            }));

            result.push({
              module: "location",
              items,
              totalCount: items.length,
            });
          }
        }
        if (modules.includes("event")) {
          console.log("module", "event");

          const events = await daoEventSelectQuery(
            {
              status: PublishStatus.PUBLISHED,
              lastEventDate: {
                gt: new Date(new Date().setHours(0, 0, 0, 0)),
              },
              ...query,
            },
            {
              id: true,
              ...daoSharedGetTranslatedSelectColumns([
                "title",
                "slug",
                "description",
              ]),
              // heroImage: {
              //   select: {
              //     id: true,
              //     status: true,
              //     meta: true,
              //     cropPosition: true,
              //   },
              // },
              // dates: {
              //   select: {
              //     date: true,
              //     begin: true,
              //     end: true,
              //   },
              //   where: {
              //     date: {
              //       gt: new Date(new Date().setHours(0, 0, 0, 0)),
              //     },
              //   },
              //   orderBy: {
              //     date: "asc",
              //   },
              //   take: 1,
              // },
              locations: {
                select: {
                  id: true,
                  ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
                  lng: true,
                  lat: true,
                },
                where: {
                  status: PublishStatus.PUBLISHED,
                },
              },
            },
            {
              [`title_${args.lang}`]: "asc",
            },
            0,
            25
          );

          if (events && events.length > 0) {
            const items = events.map((evnt: any) => ({
              id: evnt.id,
              type: "event",
              title: daoSharedMapTranslatedColumnsInRowToJson(evnt, "title"),
              excerpt: daoSharedMapTranslatedColumnsInRowToJson(
                evnt,
                "description",
                asTrimmedText
              ),
              slug: daoSharedMapTranslatedColumnsInRowToJson(evnt, "slug"),
              // dates: evnt.dates,
              locations: evnt?.locations,
              // heroImage:
              //   evnt?.heroImage?.id &&
              //   evnt?.heroImage?.status === ImageStatus.READY
              //     ? evnt?.heroImage
              //     : undefined,
              geopoint:
                evnt?.locations?.length > 0
                  ? {
                      lat: evnt?.locations[0].lat,
                      lng: evnt?.locations[0].lng,
                    }
                  : null,
            }));

            result.push({
              module: "event",
              items,
              totalCount: items.length,
            });
          }
        }
        if (modules.includes("page")) {
          console.log("module", "page");

          const pages = await daoPageSelectQuery(
            {
              status: PublishStatus.PUBLISHED,
              ...query,
            },
            {
              id: true,
              ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
              // heroImage: {
              //   select: {
              //     id: true,
              //     status: true,
              //     meta: true,
              //     cropPosition: true,
              //   },
              // },
            },
            {
              [`title_${args.lang}`]: "asc",
            },
            0,
            25
          );

          if (pages && pages.length > 0) {
            const items = pages.map((page: any) => ({
              id: page.id,
              type: "page",
              title: daoSharedMapTranslatedColumnsInRowToJson(page, "title"),
              slug: daoSharedMapTranslatedColumnsInRowToJson(page, "slug"),
              // excerpt: daoSharedMapTranslatedColumnsInRowToJson(
              //   page,
              //   "intro",
              //   asTrimmedText
              // ),
              //   heroImage:
              //     page?.heroImage?.id &&
              //     page?.heroImage?.status === ImageStatus.READY
              //       ? page?.heroImage
              //       : undefined,
            }));

            result.push({
              module: "page",
              items,
              totalCount: items.length,
            });
          }
        }
        /// tour stop count ... TODO:
        if (modules.includes("tour")) {
          console.log("module", "tour");

          const tours = await daoTourSelectQuery(
            {
              status: PublishStatus.PUBLISHED,
              ...query,
            },
            {
              id: true,
              ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
              // heroImage: {
              //   select: {
              //     id: true,
              //     status: true,
              //     meta: true,
              //     cropPosition: true,
              //   },
              // },
              // orderNumber: true,
              // _count: {
              //   select: { tourStops: true },
              // },
            },
            {
              orderNumber: "asc",
            },
            0,
            25
          );

          if (tours && tours.length > 0) {
            const items = tours.map((tour: any) => ({
              id: tour.id,
              type: "tour",
              title: daoSharedMapTranslatedColumnsInRowToJson(tour, "title"),
              // teaser: daoSharedMapTranslatedColumnsInRowToJson(tour, "teaser"),
              slug: daoSharedMapTranslatedColumnsInRowToJson(tour, "slug"),
              // heroImage:
              //   tour?.heroImage?.id &&
              //   tour?.heroImage?.status === ImageStatus.READY
              //     ? tour?.heroImage
              //     : undefined,
              countTourStops: tour?._count?.tourStops,
            }));

            result.push({
              module: "tour",
              items,
              totalCount: items.length,
            });
          }
        }
        return result;
      },
    });
  },
});
