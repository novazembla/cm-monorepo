import axios, { AxiosResponse } from "axios";
import axiosRetry from "axios-retry";
import pMap from "p-map";
import hash from "object-hash";
import { DataImportStatus, PublishStatus } from "@culturemap/core";
import dedent from "dedent";

import logger from "../services/serviceLogging";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma, { DataImport } from "@prisma/client";

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

const eventCategoriesSlugDE = "veranstaltungsart";
let eventCategories: any = {};
let log: string[] = [];
let errors: string[] = [];
let warnings: string[] = [];

let importLog: DataImport;

const getValue = (val: any) => {
  if (val) return `${val}`.trim() ?? "";
  return "";
};

const saveDataImportLog = async (
  prisma: Prisma.PrismaClient,
  status: DataImportStatus,
  owner?: Prisma.User
) => {
  if (!importLog) {
    importLog = await prisma.dataImport.create({
      data: {
        title: "Berlin.de Kalender Import",
        type: "event",
        owner: {
          connect: {
            id: owner?.id ?? 0,
          },
        },
        log,
        warnings,
        errors,
        status,
      },
    });
  }

  if (importLog) {
    importLog = await prisma.dataImport.update({
      data: {
        log,
        warnings,
        errors,
        status,
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
      `Fehlender Kartenpunkt für berlin.de Veranstaltungsort ID: ${eventLocationId}, Name: "${name}"`
    );
  }

  locations[eventLocationId.toString()] = location;
  return location;
};

const extractFullText = (data: any) => {
  return `
  ${data.description_de} ${data.description_en} 
  ${data.title_de} ${data.title_en} 
  ${data.slug_de} ${data.slug_en} 
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
      slug_de: eventCategoriesSlugDE,
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
              name_de: termDE,
            },
          });

          if (!term && taxonomy) {
            let termEN = category.EN.trim();
            if (termEN === "") {
              termEN = termDE;
              warnings.push(
                `Fehlende englische Übersetzung, nutze deutschen Namen: ${termDE}`
              );
            }

            term = await prisma.term.create({
              data: {
                slug_de: `ecat-${slugify(termDE)}`,
                slug_en: `ecat-en-${slugify(termEN)}`,
                name_de: termDE,
                name_en: termEN,
                fullText: `ecat-${slugify(termDE)} ecat-en-${slugify(
                  termDE
                )} ${termDE} ${termEN}`,
                taxonomy: {
                  connect: {
                    id: taxonomy.id,
                  },
                },
              },
            });
            logger.info(
              `import.berlin.de: Neuer Begriff erstellt ${termDE}/${termEN}`
            );
            log.push(`Neuer Begriff erstellt ${termDE}/${termEN}`);
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

    log.push("Beginne DataImport Prozess");

    const eventOwner = await findEventOwner(prisma);
    if (!eventOwner || !eventOwner?.id)
      throw Error(
        "Konnte die KartenpunktautorIn nicht bestimmen. Bitte setzen Sie bei einer NutzerIn das Attribut: DataImportBesitzerIn"
      );

    try {
      await saveDataImportLog(prisma, DataImportStatus.PROCESSING, eventOwner);
      await client
        .get(apiConfig.eventDataImportUrl, {
          headers: { "User-Agent": "CultureMap 1.0" },
        })
        .then(async (response: AxiosResponse<any>) => {
          if (response.data && isObject(response?.data?.events)) {
            log.push(`Kalender von ${apiConfig.eventDataImportUrl} eingelesen`);
            await saveDataImportLog(prisma, DataImportStatus.PROCESSING);

            if (isObject(response?.data?.kategorien)) {
              await registerEventCategoies(prisma, response?.data?.kategorien);
              await saveDataImportLog(prisma, DataImportStatus.PROCESSING);
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
              `${count.events} Veranstaltungen mit ${count.datesCurrent} Terminen gefunden`
            );
            log.push(`Beginne den import dieser ....`);
            await saveDataImportLog(prisma, DataImportStatus.PROCESSING);

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
                      if (eventCategories[kKey])
                        agg.push(eventCategories[kKey]);
                      return agg;
                    },
                    [] as any
                  );
                }

                let veranstalter =
                  response?.data?.veranstalter && event?.event_veranstalter_id
                    ? response?.data?.veranstalter[event?.event_veranstalter_id]
                    : null;

                const veranstaltungsort =
                  response?.data?.veranstaltungsorte &&
                  event?.event_veranstaltungsort_id
                    ? response?.data?.veranstaltungsorte[
                        event?.event_veranstaltungsort_id
                      ]
                    : null;

                const sharedData = {
                  description_de: convertToHtml(event.event_beschreibung_de),
                  description_en: convertToHtml(event.event_beschreibung_en),
                  title_de: event.event_titel_de,
                  title_en:
                    event.event_titel_en !== ""
                      ? event.event_titel_en
                      : event.event_titel_de,
                  slug_de: `veranstaltung-${slugify(event.event_titel_de)}-${
                    event.event_id
                  }`,
                  slug_en: `event-${slugify(event.event_titel_en)}-${
                    event.event_id
                  }`,

                  organiser: convertToHtml(
                    dedent`${getValue(veranstalter?.name)}
                  ${getValue(veranstalter?.strasse)} ${getValue(
                      veranstalter?.hausnummer
                    )}
                  ${getValue(veranstalter?.plz)} ${getValue(veranstalter?.ort)}
                  `.trim()
                  ),
                  address: convertToHtml(
                    dedent`${getValue(veranstaltungsort?.name)}
                  ${getValue(veranstaltungsort?.strasse)} ${getValue(
                      veranstaltungsort?.hausnummer
                    )}
                  ${getValue(veranstaltungsort?.plz)} ${getValue(
                      veranstaltungsort?.ort
                    )}
                  `.trim()
                  ),
                  meta: {
                    event,
                    veranstalter,
                    veranstaltungsort,
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
                        createMany: { data: datesForDb },
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
                        `Neue Veranstaltung mit der ID: ${eventInDb?.id} erstellt`
                      );
                    }
                  } else {
                    log.push(
                      `Überspringe die Veranstaltung (berlin.de ID: ${event?.event_id}) da diese keine zukünftigen Termine hat`
                    );
                  }
                } else {
                  if (!eventInDb.isImported) {
                    log.push(
                      `Überspringe Veranstaltung ID: ${eventInDb?.id} (berlin.de id: ${event.event_id}) da sie vom DataImport ausgenommen wurde`
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
                            createMany: { data: datesForDb },
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
                          `Veranstaltung : ${eventInDb?.id} (berlin.de id: ${event.event_id}) aktualisiert`
                        );
                      } else {
                        log.push(
                          `Überspringe Veranstaltung ID: ${eventInDb?.id} (berlin.de id: ${event.event_id}) da die Daten in der Datenbank aktuell sind`
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
                        `Lösche Veranstaltung ID: ${eventInDb?.id} (berlin.de id: ${event.event_id}) da keine zukünftigen Termine mehr vorhanden sind`
                      );
                    }
                  }
                }
              } catch (err: any) {
                logger.error(err);
                errors.push(`${err.name} ${err.message}`);
              }
              await saveDataImportLog(prisma, DataImportStatus.PROCESSING);
            };

            await pMap(Object.keys(response?.data?.events), processEvent, {
              concurrency: 1,
            });

            const toBeDeleted = await prisma.event.findMany({
              select: {
                id: true,
                slug_de: true,
                slug_en: true,
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
                `Löschte ${deleteResult.count} nicht mehr im Kalender vorhandene Veranstaltungen.`
              );
            }
          }
        })
        .catch((err) => {
          throw err;
        });
      log.push("DataImport beendet");
      await saveDataImportLog(prisma, DataImportStatus.PROCESSED);
    } catch (err: any) {
      logger.error(`import.berlin.de: ${err.name} ${err.message}`);
      errors.push(`import.berlin.de: ${err.name} ${err.message}`);
      logger.debug(JSON.stringify(err));
      await saveDataImportLog(prisma, DataImportStatus.ERROR);
    } finally {
      if (prisma) await prisma.$disconnect();
    }
  } catch (err: any) {
    logger.error(`import.berlin.de: ${err.name} ${err.message}`);
    errors.push(`import.berlin.de: ${err.name} ${err.message}`);
    logger.debug(JSON.stringify(err));
  } finally {
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
