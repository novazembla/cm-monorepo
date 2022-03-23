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
import { getApiConfig } from "../config";
import { sendEmail } from "./serviceEmail";
import { getSettings } from "./serviceSetting";

export const sendEmailSuggestionConfirmation = async (id: number | string) => {
  const apiConfig = getApiConfig();
  const settings = await getSettings("settings");

  if (!settings?.contactEmail) return;

  let subject = "";
  let body = "";

  const url = `${apiConfig.baseUrl.backend}/locations/update/${id}`;

  if (apiConfig.defaultLanguage === "en") {
    subject = `${apiConfig.email.subjectPrefix} New map location suggestion`;
    body = `Dear user,

Someone has posted a new location suggestion. Please review it using the following link: ${url}

Thank you your, 
${apiConfig.appName} team`;
  }

  if (apiConfig.defaultLanguage === "de") {
    subject = `${apiConfig.email.subjectPrefix} Neuer Kartenpunktvorschlag`;
    body = `Liebe NutzerIn,

Soeben wurde ein neuer Kartenpunktvorschlag abgesendet. Bitte Prüfen Sie diesen über den folgenden Link: ${url}

Vielen Dank, 
Ihr ${apiConfig.appName} Team`;
  }

  await sendEmail(settings?.contactEmail, subject, body);
};

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

  if (location?.id) {
    await sendEmailSuggestionConfirmation(location.id);
  }
  return location;
};
const defaults = {
  locationSuggestionCreate,
};

export default defaults;
