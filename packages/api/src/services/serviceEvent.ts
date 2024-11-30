import { Event, Prisma } from "@prisma/client";
import { daoEventGetDatesById, daoEventUpdate } from "../dao";
import { daoUserQueryFirst, daoEventCreate, daoImageUpdate } from "../dao";
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

export const eventUpdate = async (id: number, data: any): Promise<Event> => {
  const currentEventDates = await daoEventGetDatesById(id);

  // TODO: ANY!
  const updateArgs: Prisma.EventUpdateInput = {
    dates: {
      update: [],
      create: [],
      deleteMany: [],
    },
  };

  if (currentEventDates)
    // first compile the id list of the event dates that have been removed
    updateArgs.dates = currentEventDates.reduce((acc, date) => {
      if (!acc) return acc;

      if (
        Array.isArray(data.dates) &&
        data.dates.find((d: any) => d.id === date.id)
      )
        return acc;
      if (acc.deleteMany)
        (acc.deleteMany as any[]).push({
          id: date.id,
        });
      return acc;
    }, updateArgs.dates);

  if (data.dates)
    // now fill updates and deletes
    updateArgs.dates = data.dates.reduce((acc: any, date: any) => {
      if (!acc) return acc;

      const dateInDb = currentEventDates.find((d: any) => d.id === date.id);
      if (dateInDb) {
        // found let's update if needed
        if (
          dateInDb.date !== date.date ||
          dateInDb.begin ||
          dateInDb.end !== date.end
        )
          // something has changed update the entry
          acc.update.push({
            data: {
              date: date.date,
              begin: date.begin,
              end: date.end,
            },
            where: {
              id: date.id,
            },
          });
      } else if (acc.create) {
        // create new event date
        acc.create.push({
          date: date.date,
          begin: date.begin,
          end: date.end,
        });
      }
      return acc;
    }, updateArgs.dates);

  const event: Event = await daoEventUpdate(id, {
    ...data,
    ...updateArgs,
  });

  return event;
};

export const sendEmailSuggestionConfirmation = async (id: number | string) => {
  const apiConfig = getApiConfig();
  const settings = await getSettings("settings");

  if (!settings?.contactEmail) return;

  let subject = "";
  let body = "";

  const url = `${apiConfig.baseUrl.backend}/events/update/${id}`;

  if (apiConfig.defaultLanguage === "en") {
    subject = `${apiConfig.email.subjectPrefix} New event suggestion`;
    body = `Dear user,

Someone has posted a new event suggestion. Please review it using the following link: ${url}

Thank you your, 
${apiConfig.appName} team`;
  }

  if (apiConfig.defaultLanguage === "de") {
    subject = `${apiConfig.email.subjectPrefix} Neuer Veranstaltungsvorschlag`;
    body = `Liebe NutzerIn,

Soeben wurde ein neuer Veranstaltungsvorschlag abgesendet. Bitte Prüfen Sie diesen über den folgenden Link: ${url}

Vielen Dank, 
Ihr ${apiConfig.appName} Team`;
  }

  await sendEmail(settings?.contactEmail, subject, body);
};

// t.nonNull.json("title");
//     t.nonNull.json("slug");
//     t.nonNull.json("description");
//     t.nonNull.string("address");
//     t.nonNull.string("organiser");
//     t.nonNull.boolean("isFree");
//     t.json("meta");
//     t.json("terms");
//     t.json("heroImage");

export const eventSuggestionCreate = async (data: any): Promise<Event> => {
  const eventOwner = await daoUserQueryFirst({
    ownsSubmittedSuggestions: true,
  });

  if (!eventOwner) {
    logger.error("eventSuggestionCreate suggestion owner not found");
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Suggestion could not be stored in the database"
    );
  }

  const event = await daoEventCreate({
    ...data,
    socialMedia: {
      website: data?.meta?.website,
      instagram: data?.meta?.instagram,
      facebook: data?.meta?.facebook,
    },
    isImported: false,
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
        id: eventOwner.id,
      },
    },
  });

  if (event?.id && data?.heroImage?.connect?.id) {
    await daoImageUpdate(data?.heroImage?.connect?.id, {
      ...data?.heroImage?.update,
      type: "image",
    });
  }

  if (event?.id) {
    await sendEmailSuggestionConfirmation(event.id);
  }
  return event;
};

const defaults = {
  eventUpdate,
  eventSuggestionCreate,
};

export default defaults;
