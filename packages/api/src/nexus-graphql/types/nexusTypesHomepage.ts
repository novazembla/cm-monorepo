/// <reference path="../../types/nexus-typegen.ts" />

import { objectType, extendType } from "nexus";
import { PublishStatus, ImageStatus } from "@culturemap/core";

import {
  daoSettingQuery,
  daoLocationSelectQuery,
  daoTourSelectQuery,
  daoEventSelectQuery,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoSharedGetTranslatedSelectColumns,
} from "../../dao";

import { htmlToTrimmedString, htmlToText } from "../../utils";

export const Homepage = objectType({
  name: "Homepage",
  definition(t) {
    t.json("highlights");
    t.json("missionStatement");
  },
});

const descriptionMaxLength = 300;

const asTrimmedText = (val: any) => {
  return htmlToTrimmedString(val, descriptionMaxLength);
};

export const HomepageQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("homepage", {
      type: "Homepage",

      async resolve() {
        const settings = await daoSettingQuery({
          scope: "homepage",
        });

        if (!Array.isArray(settings) || settings.length === 0)
          return {
            highlights: [],
            missionStatment: null,
          };

        const configured = settings.reduce((acc, setting: any) => {
          if (
            setting.key === "highlights" &&
            Array.isArray(setting?.value?.json)
          )
            return setting?.value?.json;
          return acc;
        }, []);

        let highlights: any[] = [];

        if (configured?.length) {
          let mappedHighlights: any = configured.reduce(
            (acc: any, item: any) => {
              return {
                ...acc,
                [`${item.type}_${item.id}`]: null,
              };
            },
            {}
          );

          const cLocations = configured.reduce(
            (acc: any[], h: any, index: number) => {
              if (h.type === "location" && h?.id && h?.item?.id)
                acc.push({
                  ...h,
                  index,
                });

              return acc;
            },
            []
          );

          if (cLocations?.length) {
            const locations = await daoLocationSelectQuery(
              {
                id: {
                  in: cLocations.map((l) => l.id),
                },
                status: PublishStatus.PUBLISHED,
              },
              {
                id: true,
                lat: true,
                lng: true,
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "slug",
                  "description",
                ]),
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                  },
                },
              },
              {
                id: "asc",
              }
            );

            if (locations?.length) {
              mappedHighlights = locations.reduce((acc, loc: any) => {
                if (`location_${loc.id}` in mappedHighlights)
                  return {
                    ...acc,
                    [`location_${loc.id}`]: {
                      id: loc.id,
                      type: "location",
                      title: daoSharedMapTranslatedColumnsInRowToJson(
                        loc,
                        "title"
                      ),
                      slug: daoSharedMapTranslatedColumnsInRowToJson(
                        loc,
                        "slug"
                      ),
                      description: daoSharedMapTranslatedColumnsInRowToJson(
                        loc,
                        "description",
                        asTrimmedText
                      ),
                      heroImage:
                        loc?.heroImage?.id &&
                        loc?.heroImage?.status === ImageStatus.READY
                          ? loc?.heroImage
                          : undefined,
                    },
                  };
                return acc;
              }, mappedHighlights);
            }
          }

          const cTours = configured.reduce(
            (acc: any[], h: any, index: number) => {
              if (h.type === "tour" && h?.id && h?.item?.id)
                acc.push({
                  ...h,
                  index,
                });

              return acc;
            },
            []
          );

          if (cTours?.length) {
            const tours = await daoTourSelectQuery(
              {
                id: {
                  in: cTours.map((l) => l.id),
                },
                status: PublishStatus.PUBLISHED,
              },
              {
                id: true,
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "slug",
                  "teaser",
                ]),
                path: true,
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                  },
                },
                tourStops: {
                  select: {
                    id: true,
                    number: true,
                    ...daoSharedGetTranslatedSelectColumns(["title"]),

                    location: {
                      select: {
                        id: true,
                        lat: true,
                        lng: true,
                      },
                    },
                  },
                },
              },
              {
                id: "asc",
              }
            );

            if (tours?.length) {
              mappedHighlights = tours.reduce((acc, item: any) => {
                if (`tour_${item.id}` in mappedHighlights)
                  return {
                    ...acc,
                    [`tour_${item.id}`]: {
                      id: item.id,
                      type: "tour",
                      title: daoSharedMapTranslatedColumnsInRowToJson(
                        item,
                        "title"
                      ),
                      slug: daoSharedMapTranslatedColumnsInRowToJson(
                        item,
                        "slug"
                      ),
                      description: daoSharedMapTranslatedColumnsInRowToJson(
                        item,
                        "teaser",
                        asTrimmedText
                      ),
                      tourStops: item?.tourStops ?? [],
                      heroImage:
                        item?.heroImage?.id &&
                        item?.heroImage?.status === ImageStatus.READY
                          ? item?.heroImage
                          : undefined,
                    },
                  };
                return acc;
              }, mappedHighlights);
            }
          }

          const cEvents = configured.reduce(
            (acc: any[], h: any, index: number) => {
              if (h.type === "event" && h?.id && h?.item?.id)
                acc.push({
                  ...h,
                  index,
                });

              return acc;
            },
            []
          );

          if (cEvents?.length) {
            const events = await daoEventSelectQuery(
              {
                id: {
                  in: cEvents.map((l) => l.id),
                },
                status: PublishStatus.PUBLISHED,
              },
              {
                id: true,
                ...daoSharedGetTranslatedSelectColumns([
                  "title",
                  "slug",
                  "description",
                ]),
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                  },
                },
              },
              {
                id: "asc",
              }
            );

            if (events?.length) {
              mappedHighlights = events.reduce((acc, item: any) => {
                if (`event_${item.id}` in mappedHighlights)
                  return {
                    ...acc,
                    [`event_${item.id}`]: {
                      id: item.id,
                      type: "event",
                      title: daoSharedMapTranslatedColumnsInRowToJson(
                        item,
                        "title"
                      ),
                      slug: daoSharedMapTranslatedColumnsInRowToJson(
                        item,
                        "slug"
                      ),
                      description: daoSharedMapTranslatedColumnsInRowToJson(
                        item,
                        "description",
                        asTrimmedText
                      ),
                      heroImage:
                        item?.heroImage?.id &&
                        item?.heroImage?.status === ImageStatus.READY
                          ? item?.heroImage
                          : undefined,
                    },
                  };
                return acc;
              }, mappedHighlights);
            }
          }

          highlights = Object.keys(mappedHighlights).reduce(
            (acc: any, key: any) => {
              if (mappedHighlights[key]) acc.push(mappedHighlights[key]);

              return acc;
            },
            []
          );
        }

        return {
          highlights,
          missionStatement: settings.reduce((acc, setting: any) => {
            if (setting.key === "missionStatement") {
              return Object.keys(setting?.value?.json).reduce(
                (accMS: any, lang: any) => ({
                  ...accMS,
                  [lang]: htmlToText(setting?.value?.json[lang]),
                }),
                {}
              );
            }
            return acc;
          }, {}),
        };
      },
    });
  },
});
