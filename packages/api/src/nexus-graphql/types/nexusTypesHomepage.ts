/// <reference path="../../types/nexus-typegen.ts" />

import { objectType, extendType } from "nexus";
import { PublishStatus, ImageStatus } from "@culturemap/core";

import {
  daoLocationSelectQuery,
  daoTourSelectQuery,
  daoEventSelectQuery,
  daoSharedMapTranslatedColumnsInRowToJson,
  daoSharedGetTranslatedSelectColumns,
  daoPageGetById,
} from "../../dao";

import { htmlToTrimmedString, htmlToText } from "../../utils";
import { getSettings } from "../../services/serviceSetting";

export const Homepage = objectType({
  name: "Homepage",
  definition(t) {
    t.json("highlights");
    t.json("missionStatementPage");
    t.json("missionStatement");
  },
});

const descriptionMaxLength = 300;

const asTrimmedText = (val: any) => {
  return htmlToTrimmedString(val, descriptionMaxLength, true);
};

export const HomepageQuery = extendType({
  type: "Query",
  definition(t) {
    t.field("homepage", {
      type: "Homepage",

      async resolve() {
        const settingsHomepage = await getSettings("homepage");
        const settings = await getSettings("settings");

        if (Object.keys(settingsHomepage).length === 0)
          return {
            highlights: [],
            missionStatementPage: null,
            missionStatment: null,
          };

        let highlights: any[] = [];

        if (settingsHomepage?.highlights?.length) {
          let mappedHighlights: any = settingsHomepage?.highlights.reduce(
            (acc: any, item: any) => {
              return {
                ...acc,
                [`${item.type}_${item.id}`]: null,
              };
            },
            {}
          );

          const cLocations = settingsHomepage?.highlights.reduce(
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
                  in: cLocations.map((l: any) => l.id),
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
                primaryTerms: {
                  select: {
                    id: true,
                    ...daoSharedGetTranslatedSelectColumns(["name"]),
                    color: true,
                    colorDark: true,
                  },
                  take: 1,
                  where: {
                    taxonomyId: parseInt(
                      settings?.taxMapping?.typeOfInstitution ?? "0"
                    ),
                  },
                },
                terms: {
                  select: {
                    id: true,
                    ...daoSharedGetTranslatedSelectColumns(["name"]),
                    color: true,
                    colorDark: true,
                  },
                  take: 1,
                  where: {
                    taxonomyId: parseInt(
                      settings?.taxMapping?.typeOfInstitution ?? "0"
                    ),
                  },
                },
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
                      primaryTerms:
                        loc?.primaryTerms?.length > 0
                          ? [
                              {
                                id: loc?.primaryTerms[0].id,
                                name: daoSharedMapTranslatedColumnsInRowToJson(
                                  loc?.primaryTerms[0],
                                  "name"
                                ),
                                slug: daoSharedMapTranslatedColumnsInRowToJson(
                                  loc?.primaryTerms[0],
                                  "slug"
                                ),
                              },
                            ]
                          : [],
                      terms:
                        loc?.term?.length > 0
                          ? [
                              {
                                id: loc?.term[0].id,
                                name: daoSharedMapTranslatedColumnsInRowToJson(
                                  loc?.term[0],
                                  "name"
                                ),
                                slug: daoSharedMapTranslatedColumnsInRowToJson(
                                  loc?.term[0],
                                  "slug"
                                ),
                              },
                            ]
                          : [],
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

          const cTours = settingsHomepage?.highlights.reduce(
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
                  in: cTours.map((l: any) => l.id),
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
                        ...daoSharedGetTranslatedSelectColumns([
                          "title",
                          "slug",
                        ]),
                        primaryTerms: {
                          select: {
                            id: true,
                            ...daoSharedGetTranslatedSelectColumns(["name"]),
                            color: true,
                            colorDark: true,
                          },
                          where: {
                            taxonomyId: parseInt(
                              settings?.taxMapping?.typeOfInstitution ?? "0"
                            ),
                          },
                        },
                        terms: {
                          select: {
                            id: true,
                            ...daoSharedGetTranslatedSelectColumns(["name"]),
                            color: true,
                            colorDark: true,
                          },
                          where: {
                            taxonomyId: parseInt(
                              settings?.taxMapping?.typeOfInstitution ?? "0"
                            ),
                          },
                        },
                      },
                    },
                  },
                  where: {
                    location: {
                      status: PublishStatus.PUBLISHED,
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
                      teaser: daoSharedMapTranslatedColumnsInRowToJson(
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

          const cEvents = settingsHomepage?.highlights.reduce(
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
                  in: cEvents.map((l: any) => l.id),
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
                firstEventDate: true,
                lastEventDate: true,
                heroImage: {
                  select: {
                    id: true,
                    status: true,
                    meta: true,
                    cropPosition: true,
                  },
                },
                dates: {
                  select: {
                    id: true,
                    date: true,
                    begin: true,
                    end: true,
                  },
                  orderBy: {
                    date: "asc",
                  },
                },
                locations: {
                  select: {
                    id: true,
                    lat: true,
                    lng: true,
                    ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
                    primaryTerms: {
                      select: {
                        id: true,
                        ...daoSharedGetTranslatedSelectColumns(["name"]),
                        color: true,
                        colorDark: true,
                      },
                    },
                    terms: {
                      select: {
                        id: true,
                        ...daoSharedGetTranslatedSelectColumns(["name"]),
                        color: true,
                        colorDark: true,
                      },
                    },
                  },
                  where: {
                    status: PublishStatus.PUBLISHED,
                    primaryTerms: {
                      every: {
                        taxonomyId: parseInt(
                          settings?.taxMapping?.typeOfInstitution ?? "0"
                        ),
                      },
                    },
                    terms: {
                      every: {
                        taxonomyId: parseInt(
                          settings?.taxMapping?.typeOfInstitution ?? "0"
                        ),
                      },
                    },
                  },
                },
              },
              {
                id: "asc",
              }
            );

            if (events?.length) {
              mappedHighlights = events.reduce((acc, item: any) => {
                console.log(item);

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
                      dates: item?.dates?.length > 0 ? item?.dates : [],
                      location:
                        item?.locations?.length > 0 ? item?.locations[0] : null,
                      firstEventDate: item?.firstEventDate ?? null,
                      lastEventDate: item?.lastEventDate ?? null,
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

        let missionStatementPage: any;
        if (settingsHomepage?.missionStatementPage?.id) {
          const page = await daoPageGetById(
            settingsHomepage?.missionStatementPage?.id
          );
          if (page && page?.status === PublishStatus.PUBLISHED) {
            missionStatementPage = {
              id: page.id,
              title: daoSharedMapTranslatedColumnsInRowToJson(page, "title"),
              slug: daoSharedMapTranslatedColumnsInRowToJson(page, "slug"),
            };
          }
        }

        let missionStatement: any;
        if (settingsHomepage?.missionStatement) {
          missionStatement = Object.keys(
            settingsHomepage?.missionStatement
          ).reduce(
            (accMS: any, lang: any) => ({
              ...accMS,
              [lang]: htmlToText(settingsHomepage?.missionStatement[lang]),
            }),
            {}
          );
        }

        return {
          highlights,
          missionStatementPage,
          missionStatement,
        };
      },
    });
  },
});
