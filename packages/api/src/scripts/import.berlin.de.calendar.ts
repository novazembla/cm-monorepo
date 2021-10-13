import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import pMap from "p-map";
import hash from "object-hash";
import { PublishStatus } from "@culturemap/core";

import logger from "../services/serviceLogging";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma, { EventImportLog } from "@prisma/client";

import { getApiConfig } from "../config";

import { slugify, convertToHtml, isObject } from "../utils";

const getTodayInCurrentTZ = () => {
  let today = new Date();
  today.setHours(0, 0, 0, 0);
  today.setTime(today.getTime() + today.getTimezoneOffset() * -60000);
  return today;
};

const isDSTApplied = (d: Date) => {
  let jan = new Date(d.getFullYear(), 0, 1).getTimezoneOffset();
  let jul = new Date(d.getFullYear(), 6, 1).getTimezoneOffset();
  return Math.max(jan, jul) !== d.getTimezoneOffset();
};

const prepareDatesForDb = (dates: any[]) => {
  if (Array.isArray(dates))
    return dates.map((d) => {
      const dateTest = new Date(`${d.tag_von}T12:00:00`);
      const offset = isDSTApplied(dateTest) ? "" : "+01:00";

      const date = new Date(`${d.tag_von}T00:00:00${offset}`);
      const begin = new Date(`${d.tag_von}T${d.uhrzeit_von}${offset}`);
      const end = new Date(`${d.tag_von}T${d.uhrzeit_bis}${offset}`);

      return {
        date: date.toISOString(),
        begin,
        end,
      };
    });
  return dates;
};

const eventCategoriesSlugDE = "veranstaltungsarten";
let eventCategories: any = {};
let log: string[] = [];
let errors: string[] = [];
let warnings: string[] = [];

let importLog: EventImportLog;

const saveImportLog = async (prisma: Prisma.PrismaClient) => {
  if (!importLog) {
    importLog = await prisma.eventImportLog.create({
      data: {
        log,
        warnings,
        errors,
      },
    });
  }

  if (importLog) {
    importLog = await prisma.eventImportLog.update({
      data: {
        log,
        warnings,
        errors,
      },
      where: {
        id: importLog.id,
      },
    });
  }
};

const locations: Record<string, Prisma.Location | null> = {};

const findLocationByEventLocationId = async (
  prisma: Prisma.PrismaClient,
  eventLocationId: number,
  name: string
): Promise<Prisma.Location | null> => {
  if (eventLocationId.toString() in locations)
    return locations[eventLocationId.toString()];

  const location = await prisma.location.findFirst({
    where: {
      eventLocationId,
    },
  });

  if (!location) {
    warnings.push(
      `Could not find matching location in database. Please ensure that one of the locations has the correct event location id For berlin.de Veranstaltungsort id: ${eventLocationId}, Veranstaltungsort Name: "${name}"`
    );
  }

  locations[eventLocationId.toString()] = location;
  return location;
};

const extractFullText = (data: any) => {
  return `
  ${data.description.de} ${data.description.en} 
  ${data.title.de} ${data.title.en} 
  ${data.slug.de} ${data.slug.en} 
  ${data.isFree ? "free freier eintritt gratis" : ""}
  ${data?.meta?.veranstaltungsort?.name} ${
    data?.meta?.veranstaltungsort?.strasse
  }
  ${data?.meta?.veranstalter?.name} ${data?.meta?.veranstalter?.strasse}
`;
};

const findEventOwner = async (
  prisma: Prisma.PrismaClient
): Promise<Prisma.User | null> => {
  return prisma.user.findFirst({
    where: {
      ownsEventImports: true,
    },
    orderBy: {
      role: "asc",
    },
  });
};

const registerEventCategoies = async (
  prisma: Prisma.PrismaClient,
  categories: any
) => {
  let taxonomy = await prisma.taxonomy.findFirst({
    where: {
      slug: {
        path: ["de"],
        string_contains: eventCategoriesSlugDE,
      },
    },
  });

  if (taxonomy) {
    const checkTerm = async (key: string) => {
      try {
        const category = categories[key];
        const termDE = category.DE.trim();

        if (termDE !== "") {
          let term: any = await prisma.term.findFirst({
            where: {
              name: {
                path: ["de"],
                string_contains: termDE,
              },
            },
          });

          if (!term && taxonomy) {
            let termEN = category.EN.trim();
            if (termEN === "") {
              termEN = termDE;
              warnings.push(
                `Missing: No translation for term! Using German substitute: ${termDE}`
              );
            }

            term = await prisma.term.create({
              data: {
                slug: {
                  de: `ecat-${slugify(termDE)}`,
                  en: `ecat-en-${slugify(termEN)}`,
                },
                name: {
                  de: termDE,
                  en: termEN,
                },
                taxonomy: {
                  connect: {
                    id: taxonomy.id,
                  },
                },
              },
            });
            logger.info(
              `import.berlin.de: created new term ${termDE}/${termEN}`
            );
            log.push(`import.berlin.de: created new term ${termDE}/${termEN}`);
          }

          if (term?.id) eventCategories[`${key}`] = term.id;
        }
      } catch (err: any) {
        logger.error(err);
        errors.push(`${err.name} ${err.message}`);
      }
    };

    await pMap(Object.keys(categories), checkTerm, {
      concurrency: 1,
    });
  }
};

const doChores = async () => {
  const apiConfig = getApiConfig();

  const { PrismaClient } = Prisma;
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${apiConfig.db.url}&connection_limit=1`,
      },
    },
  });

  try {
    const client = axios.create();
    axiosRetry(client, { retries: 3 });

    log.push("Starting import process");

    const eventOwner = await findEventOwner(prisma);
    if (!eventOwner || !eventOwner?.id)
      throw Error(
        "Could not find event owner. Please ensure one user is set to be the imported events' owner"
      );

    await saveImportLog(prisma);
    await client
      .get(apiConfig.eventImportUrl, {
        headers: { "User-Agent": "CultureMap 1.0" },
      })
      .then(async (response: AxiosResponse<any>) => {
        if (response.data && isObject(response?.data?.events)) {
          log.push(`Retrieved event listing from ${apiConfig.eventImportUrl}`);
          await saveImportLog(prisma);

          if (isObject(response?.data?.kategorien)) {
            await registerEventCategoies(prisma, response?.data?.kategorien);
            await saveImportLog(prisma);
          }

          let today = getTodayInCurrentTZ();
          const count = Object.keys(response?.data?.events).reduce(
            (cnt: any, key: string) => {
              const event: any = response?.data?.events[key];
              let dates = [];
              if (isObject(event?.termine)) {
                dates = Object.keys(event?.termine).map(
                  (tkey: string) => event?.termine[tkey]
                );
              }

              return {
                events: cnt.events + 1,
                datesAll: cnt.datesAll + dates.length,
                datesCurrent:
                  cnt.datesCurrent +
                  dates.filter((dF) => new Date(dF.tag_von) >= today).length,
              };
            },
            {
              events: 0,
              datesAll: 0,
              datesCurrent: 0,
            }
          );

          log.push(
            `Found ${count.events} events with ${count.datesCurrent} (upcoming) dates`
          );
          log.push(`Starting to process events`);
          await saveImportLog(prisma);

          const processEvent = async (key: string) => {
            try {
              const event: any = response?.data?.events[key];
              const eventHash = hash({
                id: event.event_id,
              });

              let eventInDb: any = await prisma.event.findFirst({
                where: {
                  importedEventHash: eventHash,
                },
                include: {
                  locations: true,
                },
              });

              const locationId =
                event.event_veranstaltungsort_id.trim() !== ""
                  ? parseInt(event.event_veranstaltungsort_id.trim())
                  : 0;

              const location = await findLocationByEventLocationId(
                prisma,
                locationId,
                response?.data?.veranstaltungsorte[
                  event.event_veranstaltungsort_id
                ]?.name
              );

              let dates = [];
              today = getTodayInCurrentTZ();

              if (isObject(event?.termine)) {
                dates = Object.keys(event?.termine).map(
                  (tkey: string) => event?.termine[tkey]
                );
                dates = dates.filter((dF) => new Date(dF.tag_von) >= today);
              }

              let mappedIds = [];
              let terms = {};
              if (
                event.kategorie_ids &&
                Object.keys(event.kategorie_ids).length > 0
              ) {
                mappedIds = Object.keys(event.kategorie_ids).reduce(
                  (agg, kKey) => {
                    if (eventCategories[kKey]) agg.push(eventCategories[kKey]);
                    return agg;
                  },
                  [] as any
                );
              }

              const sharedData = {
                description: {
                  de: convertToHtml(event.event_beschreibung_de),
                  en: convertToHtml(event.event_beschreibung_en),
                },
                title: {
                  de: event.event_titel_de,
                  en:
                    event.event_titel_en !== ""
                      ? event.event_titel_en
                      : event.event_titel_de,
                },
                slug: {
                  de: `veranstaltung-${slugify(event.event_titel_de)}-${
                    event.event_id
                  }`,
                  en: `event-${slugify(event.event_titel_en)}-${
                    event.event_id
                  }`,
                },
                meta: {
                  event,
                  veranstalter:
                    response?.data?.veranstalter && event?.event_veranstalter_id
                      ? response?.data?.veranstalter[
                          event?.event_veranstalter_id
                        ]
                      : null,
                  veranstaltungsort:
                    response?.data?.veranstaltungsorte &&
                    event?.event_veranstaltungsort_id
                      ? response?.data?.veranstaltungsorte[
                          event?.event_veranstaltungsort_id
                        ]
                      : null,
                  lastUpdate: new Date().toUTCString(),
                } as any,
                isFree: event?.event_ist_gratis === "1",
                isImported: true,
              };

              const datesForDb = prepareDatesForDb(dates);

              if (!eventInDb) {
                if (dates.length > 0) {
                  if (mappedIds.length > 0) {
                    terms = {
                      terms: {
                        connect: mappedIds.map((id: number) => ({
                          id,
                        })),
                      },
                    };
                  }

                  const data = {
                    ...sharedData,
                    ...terms,
                    dates: {
                      create: datesForDb,
                    },
                    importedEventHash: eventHash,
                    status: PublishStatus.PUBLISHED,
                    owner: {
                      connect: {
                        id: eventOwner.id,
                      },
                    },
                    ...(location
                      ? {
                          locations: {
                            connect: {
                              id: location.id,
                            },
                          },
                        }
                      : {}),
                  };

                  eventInDb = await prisma.event.create({
                    data: {
                      ...data,
                      fullText: extractFullText(data),
                    },
                  });

                  if (eventInDb) {
                    log.push(
                      `Created new event in database with ID: ${eventInDb?.id}`
                    );
                  }
                } else {
                  log.push(
                    `Skipped creation of new event as event with event_id ${event?.event_id} has got no upcomming dates`
                  );
                }
              } else {
                if (!eventInDb.isImported) {
                  log.push(
                    `Skipped event ID: ${eventInDb?.id} (berlin.de id: ${event.event_id}) as isImported is set to false`
                  );
                } else {
                  if (dates.length > 0) {
                    let skip = false;
                    if (eventInDb.meta.lastUpdate) {
                      const updated = new Date(eventInDb.meta.lastUpdate);
                      const modified = new Date(
                        new Date().setTime(
                          parseInt(event.event_last_mod) * 1000
                        )
                      );
                      skip = true;
                      if (modified > updated) skip = false;
                    }

                    if (
                      location &&
                      (!eventInDb.locations ||
                        eventInDb.locations.length === 0 ||
                        (eventInDb.locations.length &&
                          !eventInDb.locations.find(
                            (l: any) => l.id === location.id
                          )))
                    ) {
                      // location needs update
                      skip = false;
                    }

                    if (!skip) {
                      await prisma.eventDate.deleteMany({
                        where: {
                          event: {
                            id: eventInDb.id,
                          },
                        },
                      });

                      if (mappedIds.length > 0) {
                        terms = {
                          terms: {
                            set: mappedIds.map((id: number) => ({
                              id,
                            })),
                          },
                        };
                      }

                      const data = {
                        ...sharedData,
                        ...terms,
                        dates: {
                          create: datesForDb,
                        },
                        locations: {
                          set: location
                            ? [
                                {
                                  id: location.id,
                                },
                              ]
                            : [],
                        },
                      };

                      eventInDb = await prisma.event.update({
                        data: {
                          ...data,
                          fullText: extractFullText(data),
                        },
                        where: {
                          id: eventInDb.id,
                        },
                      });

                      // TODO: that next.js trigger updates on frontend via get request
                      log.push(
                        `Updated event ID: ${eventInDb?.id} (berlin.de id: ${event.event_id})`
                      );
                    } else {
                      log.push(
                        `Skipped event ID: ${eventInDb?.id} (berlin.de id: ${event.event_id}) as last modified < update date`
                      );
                    }
                  } else {
                    // TODO: that next.js trigger updates on frontend via get request
                    await prisma.event.delete({
                      where: {
                        id: eventInDb.id,
                      },
                    });
                    log.push(
                      `Deleted event ID: ${eventInDb?.id} (berlin.de id: ${event.event_id}) as next upcoming events = 0`
                    );
                  }
                }
              }
            } catch (err: any) {
              logger.error(err);
              errors.push(`${err.name} ${err.message}`);
            }
            await saveImportLog(prisma);
          };

          await pMap(Object.keys(response?.data?.events), processEvent, {
            concurrency: 1,
          });

          const toBeDeleted = await prisma.event.findMany({
            select: {
              id: true,
              slug: true,
            },
            where: {
              isImported: true,
              importedEventHash: {
                not: {
                  in: Object.keys(response?.data?.events).map((eKey) =>
                    hash({
                      id: response.data.events[eKey].event_id,
                    })
                  ),
                },
              },
            },
          });

          if (toBeDeleted && toBeDeleted.length > 0) {
            // TODO: that next.js trigger updates on frontend via get request
            const deleteResult = await prisma.event.deleteMany({
              where: {
                id: {
                  in: toBeDeleted.map((e) => e.id),
                },
              },
            });
            log.push(
              `Removed ${deleteResult.count} event(s) as they did not appear in the import data anymore`
            );
          }
        }
      })
      .catch((err) => {
        throw err;
      });
    log.push("import finished");
  } catch (err: any) {
    logger.error(`import.berlin.de: ${err.name} ${err.message}`);
    errors.push(`import.berlin.de: ${err.name} ${err.message}`);
    logger.debug(JSON.stringify(err));
  } finally {
    await saveImportLog(prisma);
    if (prisma) await prisma.$disconnect();
  }
};

doChores()
  .then(async () => {
    logger.info(
      `import.berlin.de: errors: ${errors.length}, warnings: ${warnings.length}, log: ${log.length}`
    );
    logger.info("import.berlin.de: done");
    process.exit(0);
  })
  .catch((err: any) => {
    logger.error(`import.berlin.de: ${err.name} ${err.message}`);
    logger.debug(JSON.stringify(err));
    process.exit(1);
  });
