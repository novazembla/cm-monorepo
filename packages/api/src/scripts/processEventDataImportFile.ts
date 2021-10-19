import dotenv from "dotenv";

import { parse } from "@fast-csv/parse";
import { access } from "fs/promises";
import { createReadStream } from "fs";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import minimist from "minimist";
import hash from "object-hash";
import { customAlphabet } from "nanoid";
import pMap from "p-map";

import { getApiConfig } from "../config";
import {
  DataImportStatus,
  dataImportHeadersEvent,
  dataImportRequiredHeadersEvent,
  PublishStatus,
} from "@culturemap/core";

import logger from "../services/serviceLogging";
import { slugify, convertToHtml } from "../utils";

import { daoSharedGenerateFullText } from "../dao/shared";

const { PrismaClient } = Prisma;

const nanoid = customAlphabet("1234567890abcdef", 12);

dotenv.config();

const apiConfig = getApiConfig();

const log: string[] = [];
const warnings: string[] = [];
const errors: string[] = [];
let headers: any[] = [];
let headersUnparsed: any = {};
let unknownHeadersCounter = 0;
const eventCategoriesSlugDE = "veranstaltungsart";

let eventTypeTax: any;
let termsEventType: any = {};
let locations: any = {};
let locationsResolved: any = {};

let lang = "en";

const trimString = (str: string, length: number) =>
  str.length > length ? str.substring(0, length - 3) + "..." : str;

const mapKeyToHeader = (mapping: any[], key: string) => {
  const match = mapping.find((m) => m.match === key);
  if (!match || !match.headerKey || !headers.includes(match.headerKey))
    return undefined;

  return match.headerKey;
};
const getTermsOfRow = async (
  mapping: any[],
  row: any[],
  prisma: Prisma.PrismaClient
) => {
  const keys = [
    "tax-event-type-1",
    "tax-event-type-2",
    "tax-event-type-3",
    "tax-event-type-4",
    "tax-event-type-5",
    "tax-event-type-6",
    "tax-event-type-7",
    "tax-event-type-8",
    "tax-event-type-9",
    "tax-event-type-10",
  ];

  await Promise.all(
    keys.map(async (key: string) => {
      const headerKey = mapKeyToHeader(mapping, key);

      if (headerKey) {
        const value =
          row[headerKey] && row[headerKey].trim() !== ""
            ? row[headerKey].trim().toLowerCase()
            : undefined;
        if (value) {
          if (!termsEventType[slugify(value)]) {
            let termDE = row[headerKey];

            warnings.push(
              `Fehlende englische Übersetzung, nutze deutschen Namen: ${termDE}`
            );

            const term = await prisma.term.create({
              data: {
                slug_de: `ecat-${slugify(termDE)}`,
                slug_en: `ecat-en-${slugify(termDE)}`,
                name_de: termDE,
                name_en: termDE,
                fullText: `ecat-${slugify(termDE)} ecat-en-${slugify(
                  termDE
                )} ${termDE}`,
                taxonomy: {
                  connect: {
                    id: eventTypeTax.id,
                  },
                },
              },
            });
            if (term) {
              termsEventType[slugify(termDE.trim().toLowerCase())] = term;
              logger.info(`processEventDataImport: Created new term ${termDE}`);
              log.push(
                lang === "de"
                  ? `Neuer Begriff erstellt ${termDE}`
                  : `Created new term ${termDE}`
              );
            }
          }
        }
      }
    })
  );

  return keys.reduce((acc, key) => {
    const headerKey = mapKeyToHeader(mapping, key);

    if (!headerKey) return acc;

    const value =
      row[headerKey] && row[headerKey].trim() !== ""
        ? row[headerKey].trim().toLowerCase()
        : undefined;

    if (value) {
      const term = termsEventType[slugify(value)];

      if (term?.id)
        acc.push({
          id: term.id,
        });
    }

    return acc;
  }, [] as any);
};

const getRowValueOrEmptyString = (mapping: any[], row: any[], key: string) => {
  try {
    const headerKey = mapKeyToHeader(mapping, key);

    if (headerKey && row[headerKey]) return `${row[headerKey]}`.trim();
  } catch (err) {}

  return "";
};

const processDataImportedRow = async (
  prisma: Prisma.PrismaClient,
  mapping: any[],
  row: any[],
  ownerId: number
) => {
  try {
    let titleDe = getRowValueOrEmptyString(mapping, row, "title-de");
    let titleEn = getRowValueOrEmptyString(mapping, row, "title-en");
    let eventId = getRowValueOrEmptyString(mapping, row, "eventId");

    if (titleDe === "" && titleEn !== "") titleDe = titleEn;

    if (titleEn === "" && titleDe !== "") titleEn = titleDe;

    const eventHash = hash({
      eventId,
    });

    let eventInDb = await prisma.event.findFirst({
      where: {
        importedEventHash: eventHash,
      },
    });

    const eventLocationId = getRowValueOrEmptyString(
      mapping,
      row,
      "eventLocationId"
    );

    let locationInDb: Prisma.Location | null = null;

    let hasWarnings = false;

    if (eventLocationId !== "" && parseInt(eventLocationId)) {
      if (!locations[eventLocationId] && !locationsResolved[eventLocationId]) {
        locationInDb = await prisma.location.findFirst({
          where: {
            eventLocationId: parseInt(eventLocationId),
          },
        });

        locationsResolved[eventLocationId] = true;
        if (!locationInDb) {
          warnings.push(
            lang === "de"
              ? `Konnte Kartenpunkt nicht mittels Veranstaltungsort ID ${eventLocationId} identifizieren`
              : `Failed to retrieve location from Event Location ID ${eventLocationId} `
          );
          hasWarnings = true;
        } else {
          locations[eventLocationId] = locationInDb;
        }
      } else {
        locationInDb = locations[eventLocationId];
      }
    }

    let terms = await getTermsOfRow(mapping, row, prisma);

    const columnIsFree = getRowValueOrEmptyString(mapping, row, "isFree")
      .toLowerCase()
      .trim();

    const sharedData = {
      title_de: titleDe,
      title_en: titleEn,
      slug_de: `${slugify(titleDe)}-de-${nanoid()}`,
      slug_en: `${slugify(titleEn)}-en-${nanoid()}`,
      description_de: convertToHtml(
        getRowValueOrEmptyString(mapping, row, "description-de")
      ),
      description_en: convertToHtml(
        getRowValueOrEmptyString(mapping, row, "description-en")
      ),
      address: convertToHtml(getRowValueOrEmptyString(mapping, row, "address")),
      organiser: convertToHtml(
        getRowValueOrEmptyString(mapping, row, "organiser")
      ),
      isFree: columnIsFree === "ja" || columnIsFree === "yes",
      meta: {
        eventId,
        eventLocationId,
      },
      importedEventHash: eventHash,
    };

    const datesCol = getRowValueOrEmptyString(mapping, row, "dates");
    let datesForDb: any = [];

    if (datesCol !== "") {
      datesForDb = datesCol
        .split(",")
        .map((dateRow: string) => {
          try {
            const beginEnd = dateRow.split(" - ");
            if (beginEnd.length === 2) {
              const begin = new Date(beginEnd[0].trim());
              const end = new Date(beginEnd[1].trim());

              return {
                date: begin,
                begin,
                end,
              };
            }
          } catch (err) {}

          return false;
        })
        .filter((d) => !!d);
    }

    if (eventInDb && eventInDb.id) {
      await prisma.eventDate.deleteMany({
        where: {
          event: {
            id: eventInDb.id,
          },
        },
      });

      let data: any = {
        ...sharedData,
        terms: {
          set: terms,
        },
        dates: {
          createMany: { data: datesForDb },
        },
        fullText: daoSharedGenerateFullText(
          sharedData,
          ["title", "slug", "description", "address", "organiser"],
          ["title", "slug", "description"]
        ),
      };

      eventInDb = await prisma.event.update({
        data: {
          ...data,
          locations: locationInDb?.id
            ? {
                set: {
                  id: locationInDb.id,
                },
              }
            : undefined,
          status: hasWarnings
            ? PublishStatus.IMPORTEDWARNINGS
            : PublishStatus.IMPORTED,
        },
        where: {
          id: eventInDb.id,
        },
      });

      if (eventInDb?.id) {
        log.push(
          lang === "de"
            ? `Veranstaltung Id ${eventInDb.id} aktualisiert`
            : `Updated event id ${eventInDb.id}`
        );
      } else {
        errors.push(
          lang === "de"
            ? `Konnte neuen Veranstaltung für "${data.title.de}" nicht erstellen`
            : `Failed to create new event ${data.title.de}`
        );
      }
    } else {
      const data = {
        owner: {
          connect: {
            id: ownerId,
          },
        },
        locations: locationInDb?.id
          ? {
              connect: {
                id: locationInDb.id,
              },
            }
          : undefined,
        ...sharedData,
        ...(terms && terms.length > 0
          ? {
              terms: {
                connect: terms,
              },
            }
          : {}),
      };

      eventInDb = await prisma.event.create({
        data: {
          ...data,
          dates: {
            createMany: { data: datesForDb },
          },
          status: hasWarnings
            ? PublishStatus.IMPORTEDWARNINGS
            : PublishStatus.IMPORTED,
          fullText: daoSharedGenerateFullText(
            sharedData,
            ["title", "slug", "description", "address", "organiser"],
            ["title", "slug", "description"]
          ),
        },
      });

      if (eventInDb?.id) {
        log.push(
          lang === "de"
            ? `Neuer Veranstaltung mit der ID ${eventInDb.id} erstellt`
            : `Created new event with id ${eventInDb.id}`
        );
      } else {
        errors.push(
          lang === "de"
            ? `Veranstaltung für "${data.title_de}" konnte nicht erstellt werden`
            : `Failed to create new event ${data.title_de}`
        );
      }
    }
  } catch (err: any) {
    errors.push(`${err.name} ${err.message}`);
  }
};

const doChores = async () => {
  const args = minimist(process.argv.slice(2), {
    //string: ['tokenURI', 'metadataURI', 'contentHash', 'metadataHash'],
  });

  if (!args.importId) throw new Error("please set an import id via --importId");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${apiConfig.db.url}&connection_limit=1`,
      },
    },
  });

  try {
    const importInDb = await prisma.dataImport.findUnique({
      where: {
        id: args.importId,
      },
      include: {
        file: true,
        owner: true,
      },
    });

    if (importInDb) {
      if (![DataImportStatus.PROCESS].includes(importInDb.status ?? -1))
        throw Error("Status of import excludes it from processing");

      lang = importInDb.lang;

      const file = (importInDb?.file?.meta as any)?.originalFilePath;
      if (!file)
        throw Error(
          lang === "de"
            ? `Keine Datei für DataImport id ${args.importId} gefunden`
            : `No file uploaded for import id ${args.importId}`
        );

      if (!importInDb?.owner?.id)
        throw Error(
          lang === "de"
            ? `Keine BesiterIn für DataImport id ${args.importId} gefunden`
            : `No owner found for import id ${args.importId}`
        );

      log.push(
        lang === "de" ? `Beginne DataImport ...` : `Starting to process import.`
      );

      await prisma.dataImport.update({
        data: {
          status: DataImportStatus.PROCESSING,
          log,
          warnings,
          errors,
        },
        where: {
          id: importInDb.id,
        },
      });

      try {
        const mapping = importInDb.mapping;

        if (!Array.isArray(mapping) || mapping.length === 0)
          throw Error(
            lang === "de"
              ? `Die Spaltenzuweisung konnte nicht gefunden werden`
              : "mapping could not be retrieved from db"
          );

        // is the file readable?
        await access(file);

        eventTypeTax = await prisma.taxonomy.findFirst({
          where: {
            OR: [
              {
                slug_de: eventCategoriesSlugDE,
              },
              {
                slug_en: eventCategoriesSlugDE,
              },
            ],
          },
        });

        if (eventTypeTax && eventTypeTax.id) {
          const terms = await prisma.term.findMany({
            where: {
              taxonomy: {
                id: eventTypeTax.id,
              },
            },
          });

          if (terms) {
            termsEventType = terms.reduce((acc: any, t: any) => {
              let out = acc;

              if (t.name_de.trim() !== "")
                out = {
                  ...acc,
                  [slugify(t.name_de.trim().toLowerCase())]: t,
                };

              if (
                t.name_en.trim() !== "" &&
                t.name_en.trim() !== t.name_de.trim()
              )
                out = {
                  ...out,
                  [slugify(t.name_en.trim().toLowerCase())]: t,
                };

              return out;
            }, {} as any);
          } else {
            throw Error(
              importInDb.lang === "de"
                ? "Konnte die Begriffe der Taxonomie 'Veranstaltungsart' - Slug 'veranstaltungsart' nicht finden"
                : "Could not retrieve terms for 'Veranstaltungsart' - Slug 'veranstaltungsart'"
            );
          }
        }

        const rows: any[] = [];
        await new Promise((resolve, reject) => {
          createReadStream(file)
            .pipe(
              parse({
                strictColumnHandling: true,
                delimiter: ";",
                maxRows: 10000,
                headers: (hdrs) => {
                  const mappedHeaders = hdrs.map((h) => {
                    const hTrimmed = h ? h.trim() : "";

                    if (hTrimmed === "") {
                      unknownHeadersCounter += 1;

                      const uKey = `unkown-${unknownHeadersCounter}`;
                      headersUnparsed[uKey] = hTrimmed;
                      return uKey;
                    }

                    if (hTrimmed === "###") {
                      headersUnparsed[hTrimmed] = hTrimmed;
                      return hTrimmed;
                    }

                    const k = Object.keys(dataImportHeadersEvent).find(
                      (iHk) => {
                        const t = Object.keys(dataImportHeadersEvent[iHk]).find(
                          (lng) => {
                            return (
                              dataImportHeadersEvent[iHk][lng].toLowerCase() ===
                              hTrimmed.toLowerCase()
                            );
                          }
                        );
                        return !!t;
                      }
                    );

                    if (k) {
                      headersUnparsed[k] = hTrimmed;
                      return k;
                    } else {
                      unknownHeadersCounter += 1;
                      const uKey = `unkown-${unknownHeadersCounter}`;
                      headersUnparsed[uKey] = hTrimmed;
                      return uKey;
                    }
                  });

                  return mappedHeaders;
                },
                ignoreEmpty: true,
              })
            )
            .on("error", (error) => {
              logger.info(`processDataImportFile() ${error.message}§`);
              reject(error);
            })
            .on("headers", (hdrs) => {
              headers = hdrs;

              if (
                !Array.isArray(headers) ||
                headers.length - 1 <
                  Object.keys(dataImportRequiredHeadersEvent).length
              ) {
                errors.push(
                  lang === "de"
                    ? `Die hochgeladene Datei enthält weniger Spalten als die Anzahl der verpflichtenden Spalten. Bitte laden Sie nur Dateien mit mindestens ${
                        Object.keys(dataImportRequiredHeadersEvent).length
                      } Spalten, sowie einer Laufnummerspalte hoch`
                    : `The uploaded CSV did not contain the minimum number of columns. Please ensure to only upload documents that contain at least ${
                        Object.keys(dataImportRequiredHeadersEvent).length
                      } content columns and one ID column`
                );
              }
            })
            .on("data-invalid", (row) => {
              warnings.push(
                lang === "de"
                  ? `Fehler in Zeile:  ${trimString(JSON.stringify(row), 120)}`
                  : `Invalid row ${trimString(JSON.stringify(row), 120)}`
              );
            })
            .on("data", async (row) => {
              rows.push(row);
            })
            .on("end", (rowCount: number) => {
              log.push(
                lang === "de"
                  ? `DataImport beendet: ${rowCount} Zeilen bearbeitet`
                  : `DataImport done: processed ${rowCount} rows`
              );
              logger.debug(`DataImport done: processed ${rowCount} rows`);
              resolve(true);
            });
        });

        const processPMappedRow = async (row: any[]) => {
          try {
            await processDataImportedRow(
              prisma,
              mapping as any[],
              row,
              importInDb?.owner?.id
            );
            await prisma.dataImport.update({
              data: {
                status:
                  errors.length > 0
                    ? DataImportStatus.ERROR
                    : DataImportStatus.PROCESSED,
                log,
                warnings,
                errors,
              },
              where: {
                id: importInDb.id,
              },
            });
          } catch (err: any) {
            errors.push(`${err.name} ${err.message}`);
          }
        };

        await pMap(rows, processPMappedRow, {
          concurrency: 1,
        });
      } catch (err: any) {
        errors.push(err.message);
      }
    } else {
      throw Error(`DataImport id:${args.importId} not found`);
    }

    await prisma.dataImport.update({
      data: {
        status:
          errors.length > 0
            ? DataImportStatus.ERROR
            : DataImportStatus.PROCESSED,
        log,
        warnings,
        errors,
      },
      where: {
        id: importInDb.id,
      },
    });
    await prisma.$disconnect();
  } catch (err: any) {
    const importInDb = await prisma.dataImport.findUnique({
      where: {
        id: args.importId,
      },
    });

    if (importInDb) {
      errors.push(`${err.name} - ${err.message}`);
      await prisma.dataImport.update({
        data: {
          status: DataImportStatus.ERROR,
          log,
          warnings,
          errors,
        },
        where: {
          id: importInDb.id,
        },
      });
    }
    if (prisma) await prisma.$disconnect();
    logger.error(err);
    throw Error("script terminated early on error");
  }
};

process.on("unhandledRejection", (reason: any /* promise */) => {
  logger.error(`Unhandled Rejection at: ${reason.stack || reason}`);
});

doChores()
  .then(async () => {
    process.exit(0);
  })
  .catch(async (Err) => {
    logger.error(Err);
    process.exit(1);
  });
