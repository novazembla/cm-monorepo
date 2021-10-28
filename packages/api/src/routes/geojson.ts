import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
// import path from "path";

import { logger } from "../services/serviceLogging";

import { ApiError } from "../utils";
import { PublishStatus } from "@culturemap/core";

import {
  daoLocationSelectQuery,
  daoSharedGetTranslatedSelectColumns,
  daoSharedMapTranslatedColumnsInRowToJson,
} from "../dao";
import { getApiConfig } from "../config";

export const getGeoJson = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const config = getApiConfig();
  try {
    try {
      const locations = await daoLocationSelectQuery(
        {
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
        {
          id: "asc",
        }
      );

      res.json({
        type: "FeatureCollection",
        features:
          locations?.length > 0
            ? locations.map((loc: any) => {
                let color = null;
                let termId = null;

                // TODO: this should serve a cached file ...

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
                    slug: daoSharedMapTranslatedColumnsInRowToJson(loc, "slug"),
                    title: daoSharedMapTranslatedColumnsInRowToJson(
                      loc,
                      "title"
                    ),
                  },
                };
              })
            : [],
      });
    } catch (err) {
      logger.error(err);
      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "File to generate GeoJson"
      );
    }
  } catch (err: any) {
    next(err);
  }
};
export default getGeoJson;
