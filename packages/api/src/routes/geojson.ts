import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import NodeCache from "node-cache";

import { logger } from "../services/serviceLogging";

import { getPrismaClient } from "../db/client";

import { ApiError } from "../utils";
import { PublishStatus } from "@culturemap/core";

import {
  daoSharedGetTranslatedSelectColumns,
  daoSharedMapTranslatedColumnsInRowToJson,
} from "../dao";
import { getApiConfig } from "../config";

// as the creation of the GEOJSON containing all for 10 minutes
const GEOJSON_CACHE_KEY = "geojson-cache";
const GEOJSON_CACHE_EXPIRATION = 600;
const geoJSONCache = new NodeCache({
  stdTTL: GEOJSON_CACHE_EXPIRATION,
  useClones: false,
});

export const getGeoJson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const config = getApiConfig();
  const prisma = getPrismaClient();

  try {
    try {
      let isDrillDown = false;
      let where: any = [
        {
          status: PublishStatus.PUBLISHED,
        },
      ];

      try {
        const and = req?.query?.and === "1" ? true : false;
        const s = req?.query?.s ?? "";
        let terms: any[] =
          typeof req?.query?.terms === "string" &&
          req?.query?.terms.trim() !== ""
            ? req?.query?.terms.trim().split(",")
            : [];
        let subWhere: any[] = [];

        terms = terms.map((t: string) => parseInt(t.trim()));

        if (typeof s === "string" && s.trim() !== "") {
          isDrillDown = true;
          subWhere.push({
            fullText: {
              contains: typeof s === "string" ? s.trim() : s,
              mode: "insensitive",
            },
          });
        }

        if (terms?.length > 0) {
          if (and) {
            subWhere = [
              ...where,
              ...terms.map((t: any) => ({
                terms: {
                  some: {
                    id: t,
                  },
                },
              })),
            ];
          } else {
            subWhere.push({
              terms: {
                some: {
                  id: {
                    in: terms,
                  },
                },
              },
            });
          }
        }

        if (subWhere?.length) {
          isDrillDown = true;
          if (and) {
            where = [...where, ...subWhere];
          } else {
            where.push({
              OR: subWhere,
            });
          }
        }
      } catch (err) {
        // nothing to be done ...
      }

      res.set("Cache-control", `public, max-age=${GEOJSON_CACHE_EXPIRATION}`);

      if (!isDrillDown && geoJSONCache.has(GEOJSON_CACHE_KEY)) {
        res.json(geoJSONCache.get(GEOJSON_CACHE_KEY));
      } else {
        const locations = await prisma.location.findMany({
          where: {
            AND: where,
          },
          select: {
            id: true,
            lat: true,
            lng: true,
            ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
            terms: {
              select: {
                id: true,
                color: true,
                colorDark: true,
              },
              take: 1,
            },
            primaryTerms: {
              select: {
                id: true,
                color: true,
                colorDark: true,
              },
              take: 1,
            },
          },
          orderBy: [
            {
              id: "asc",
            },
          ],
        });

        const geoJson = {
          type: "FeatureCollection",
          features:
            locations?.length > 0
              ? locations.map((loc: any) => {
                  let color = null;
                  let termId = null;

                  // TODO: this should also take multiple primary terms into account ...
                  if (loc?.primaryTerms?.length > 0) {
                    termId = loc?.primaryTerms[0].id;
                    color = loc?.primaryTerms[0].color.trim()
                      ? loc?.primaryTerms[0].color.trim()
                      : config.defaultPinColor;
                  } else if (loc?.terms?.length > 0) {
                    termId = loc?.terms[0].id;
                    color = loc?.terms[0].color.trim()
                      ? loc?.terms[0].color.trim()
                      : config.defaultPinColor;
                  }

                  return {
                    type: "Feature",
                    geometry: {
                      coordinates: [loc?.lng ?? 0.0, loc?.lat ?? 0.0],
                      type: "Point",
                    },
                    properties: {
                      id: `loc-${loc?.id}`,
                      color: color ?? config.defaultPinColor,
                      primaryTermId: termId,
                      slug: daoSharedMapTranslatedColumnsInRowToJson(
                        loc,
                        "slug"
                      ),
                      title: daoSharedMapTranslatedColumnsInRowToJson(
                        loc,
                        "title"
                      ),
                    },
                  };
                })
              : [],
        };

        geoJSONCache.set(GEOJSON_CACHE_KEY, geoJson);
        res.json(geoJson);
      }
    } catch (err) {
      logger.error(err);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Failed to generate GeoJson"
      );
    }
  } catch (err: any) {
    next(err);
  }
};

export default getGeoJson;
