import httpStatus from "http-status";
import { Event, EventDate, Prisma } from "@prisma/client";
import { filteredOutputByBlacklist } from "@culturemap/core";

import { ApiError, filteredOutputByBlacklistOrNotFound } from "../utils";
import { getApiConfig } from "../config";
import { getPrismaClient } from "../db/client";

import {
  daoSharedCheckSlugUnique,
  daoSharedGenerateFullText,
  daoSharedMapJsonToTranslatedColumns,
  daoSharedGetTranslatedSelectColumns,
} from ".";

const prisma = getPrismaClient();
const apiConfig = getApiConfig();

export const daoEventFullTextKeys = [
  "title",
  "slug",
  "description",
  "metaDesc",
];

export const daoEventTranslatedColumns = [
  "title",
  "slug",
  "description",
  "metaDesc",
];

export const daoEventCheckSlugUnique = async (
  slug: Record<string, string>,
  uniqueInObject: boolean,
  id?: number
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  return daoSharedCheckSlugUnique(
    prisma.event.findMany,
    slug,
    uniqueInObject,
    id
  );
};

export const daoEventQuery = async (
  where: Prisma.EventWhereInput,
  include: Prisma.EventInclude | undefined,
  orderBy: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize
): Promise<Event[]> => {
  const events: Event[] = await prisma.event.findMany({
    where,
    include,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    events,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventSelectQuery = async (
  where: Prisma.EventWhereInput,
  select: Prisma.EventSelect,
  orderBy?: any,
  pageIndex: number = 0,
  pageSize: number = apiConfig.db.defaultPageSize * 3
): Promise<Event[]> => {
  const events = await prisma.event.findMany({
    where,
    select,
    orderBy,
    skip: pageIndex * pageSize,
    take: Math.min(pageSize, apiConfig.db.maxPageSize),
  });

  return filteredOutputByBlacklist(
    events,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventQueryFirst = async (
  where: Prisma.EventWhereInput,
  include: Prisma.EventInclude | undefined
): Promise<Event> => {
  const event = await prisma.event.findFirst({
    where,
    include,
    take: 1000,
  });

  return filteredOutputByBlacklistOrNotFound(
    event,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventQueryCount = async (
  where: Prisma.EventWhereInput
): Promise<number> => {
  return prisma.event.count({
    where,
  });
};

export const daoEventUpdateBeginAndEnd = async (id: number) => {
  const eventDates: EventDate[] = await prisma.eventDate.findMany({
    where: {
      eventId: id,
    },
    orderBy: {
      date: "asc",
    },
  });

  if (eventDates?.length > 0) {
    await prisma.event.update({
      data: {
        firstEventDate: eventDates[0].date,
        lastEventDate: eventDates[eventDates.length - 1].date,
      },
      where: {
        id,
      },
    });
  }
};

export const daoEventCreate = async (
  data: Prisma.EventCreateInput
): Promise<Event> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.event.findMany,
    (data as any).slug
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let createData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoEventTranslatedColumns
  );

  const event: Event = await prisma.event.create({
    data: {
      ...createData,
      fullText: daoSharedGenerateFullText(
        createData,
        daoEventFullTextKeys,
        daoEventTranslatedColumns
      ),
    },
  });

  if (event) await daoEventUpdateBeginAndEnd(event.id);

  return filteredOutputByBlacklistOrNotFound(
    event,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventGetById = async (
  id: number,
  include?: Prisma.EventInclude | undefined
): Promise<Event> => {
  const event: Event | null = await prisma.event.findUnique({
    where: { id },
    include,
  });

  return filteredOutputByBlacklistOrNotFound(
    event,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventUpdate = async (
  id: number,
  data: Prisma.EventUpdateInput
): Promise<Event> => {
  const result = await daoSharedCheckSlugUnique(
    prisma.event.findMany,
    (data as any).slug,
    true,
    id
  );

  if (!result.ok)
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      `Slug is not unique in [${Object.keys(result.errors).join(",")}]`
    );

  let updateData = daoSharedMapJsonToTranslatedColumns(
    data,
    daoEventTranslatedColumns
  );

  const event: Event = await prisma.event.update({
    data: {
      ...updateData,
      fullText: daoSharedGenerateFullText(
        updateData,
        daoEventFullTextKeys,
        daoEventTranslatedColumns
      ),
    },
    where: {
      id,
    },
  });

  if (event) await daoEventUpdateBeginAndEnd(event.id);

  return filteredOutputByBlacklistOrNotFound(
    event,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventDelete = async (id: number): Promise<Event> => {
  await prisma.eventDate.deleteMany({
    where: {
      event: {
        id,
      },
    },
  });

  const event: Event = await prisma.event.delete({
    where: {
      id,
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    event,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventGetDatesById = async (
  id: number
): Promise<EventDate[]> => {
  const eventDates: EventDate[] = await prisma.eventDate.findMany({
    where: {
      event: {
        id,
      },
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    eventDates,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventDeleteDatesByIds = async (
  dateId: number,
  ids: number[]
): Promise<number> => {
  const { count } = await prisma.eventDate.deleteMany({
    where: {
      event: {
        id: dateId,
      },
      id: {
        in: ids,
      },
    },
  });

  return count;
};

export const daoEventGetBySlug = async (
  slug: string,
  include?: Prisma.EventInclude | undefined
): Promise<Event> => {
  const config = getApiConfig();

  const event = await prisma.event.findFirst({
    where: {
      OR: config?.activeLanguages.map((lang) => ({
        [`slug_${lang}`]: slug,
      })),
    },

    include: {
      ...include,
      terms: {
        select: {
          id: true,
          ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
        },
      },
      dates: {
        select: {
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
          ...daoSharedGetTranslatedSelectColumns(["title", "slug"]),
          lat: true,
          lng: true,
        },
      },
    },
  });

  return filteredOutputByBlacklistOrNotFound(
    event,
    apiConfig.db.privateJSONDataKeys.event
  );
};

export const daoEventChangeOwner = async (
  oldOwnerId: number,
  newOwnerId: number
): Promise<number> => {
  const result = await prisma.event.updateMany({
    data: {
      ownerId: newOwnerId,
    },

    where: {
      ownerId: oldOwnerId,
    },
  });

  return result.count;
};

const defaults = {
  daoEventChangeOwner,
  daoEventQuery,
  daoEventQueryFirst,
  daoEventQueryCount,
  daoEventGetById,
  daoEventGetBySlug,
  daoEventCheckSlugUnique,
  daoEventCreate,
  daoEventUpdate,
  daoEventDelete,
  daoEventSelectQuery,
  daoEventGetDatesById,
};

export default defaults;
