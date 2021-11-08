import { Location } from "@prisma/client";
import { daoUserQueryFirst, daoLocationCreate } from "../dao";
import httpStatus from "http-status";
import { ApiError } from "../utils";
import { logger } from "./serviceLogging";
import { PublishStatus } from "@culturemap/core";

export const locationSuggestionCreate = async (
  data: any
): Promise<Location> => {
  const imageOwner = await daoUserQueryFirst({
    ownsSubmittedSuggestions: true,
  });
  if (!imageOwner) {
    logger.error("locationSuggestionCreate suggestion owner not found");
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Suggestion could not be stored in the database"
    );
  }

  return daoLocationCreate({
    ...data,
    status: PublishStatus.SUGGESTION,
    owner: {
      connect: {
        id: imageOwner.id
      }
    }
  });
};
export default {
  locationSuggestionCreate,
};
