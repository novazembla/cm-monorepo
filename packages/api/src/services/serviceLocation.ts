import { Location } from "@prisma/client";
import { daoUserQueryFirst, daoLocationCreate } from "../dao";
import httpStatus from "http-status";
import { ApiError, slugify } from "../utils";
import { logger } from "./serviceLogging";
import { PublishStatus } from "@culturemap/core";
import { customAlphabet } from "nanoid";

const nanoid = customAlphabet("1234567890abcdef", 12);

export const locationSuggestionCreate = async (
  data: any
): Promise<Location> => {
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

  return daoLocationCreate({
    ...data,
    slug: {
      de: `${slugify(data?.title)}-${nanoid()}`,
      en: `${slugify(data?.title)}-${nanoid()}`,
    },
    status: PublishStatus.SUGGESTION,
    owner: {
      connect: {
        id: locationOwner.id,
      },
    },
  });
};
const defaults = {
  locationSuggestionCreate,
};

export default defaults;
