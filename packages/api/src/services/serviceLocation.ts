import { Location } from "@prisma/client";
import { daoUserQueryFirst, daoLocationCreate, daoImageUpdate } from "../dao";
import httpStatus from "http-status";
import { ApiError } from "../utils";
import { logger } from "./serviceLogging";
import { PublishStatus } from "@culturemap/core";
import { getPrismaClient } from "../db/client";
import {
  geocodingGetAddressCandidates,
  geocodingGetBestMatchingLocation,
} from "../utils/geocoding";

export const locationSuggestionCreate = async (
  data: any
): Promise<Location> => {
  const prisma = getPrismaClient();

  const locationOwner = await daoUserQueryFirst({
    ownsSubmittedSuggestions: true,
  });

  if (!locationOwner) {
    logger.error("locationSuggestionCreate suggestion owner not found");
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Suggestion could not be stored in the database"
    );
  }

  const geoCodeCandidates = await geocodingGetAddressCandidates(
    data.address,
    prisma
  );
  const point = geocodingGetBestMatchingLocation(
    geoCodeCandidates,
    data?.address?.postCode ?? ""
  );
  data = {
    ...data,
    lat: point.lat,
    lng: point.lng,
    geoCodingInfo: geoCodeCandidates,
  };

  const location = await daoLocationCreate({
    ...data,
    heroImage: data?.heroImage?.connect?.id
      ? {
          connect: {
            id: data?.heroImage?.connect?.id,
          },
        }
      : undefined,
    status: PublishStatus.SUGGESTION,
    owner: {
      connect: {
        id: locationOwner.id,
      },
    },
  });

  if (location?.id && data?.heroImage?.connect?.id) {
    await daoImageUpdate(data?.heroImage?.connect?.id, {
      ...data?.heroImage?.update,
      type: "image",
    });
  }
  return location;
};
const defaults = {
  locationSuggestionCreate,
};

export default defaults;
