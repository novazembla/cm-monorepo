import dotenv from "dotenv";
import fs from "fs";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";
import minimist from "minimist";

import { getApiConfig } from "../config";
import { ExportStatus, PublishStatus } from "@culturemap/core";
import { daoSharedGetTranslatedSelectColumns } from "../dao/shared";
import Excel from "exceljs";

import { customAlphabet } from "nanoid";

import logger from "../services/serviceLogging";
import { createApiUserFromUser, htmlToString } from "../utils";

const customNanoId = customAlphabet(
  "1234567890abcdefghijklmnopqrstuvwxyzABCDEFGIJKLMNOPQRSTUVW",
  24
);

const { PrismaClient } = Prisma;

dotenv.config();

const apiConfig = getApiConfig();

const log: string[] = [];
const errors: string[] = [];

let termsEventType: any = {};

const htmlToText = (str: string) => {
  let out = str.replaceAll("<br>", "BBBRRR<br>");
  out = out.replaceAll("<br/>", "BBBRRR<br/>");
  out = out.replaceAll("</p>", "PPPPPP</p>");
  out = htmlToString(out) ?? "";
  out = out.replaceAll("BBBRRR", "\n");
  return out.replaceAll("PPPPPP", "\n\n");
};

const getTermName = (
  taxonomy: string,
  terms: any[],
  index: number,
  lang: string,
  primaryTerms?: any[]
) => {
  if (!Array.isArray(terms) || terms.length === 0) return "";

  const termsInTax = terms.filter((term) => {
    switch (taxonomy) {
      case "eventType":
        return (
          typeof termsEventType[term.id] !== "undefined" &&
          (!Array.isArray(primaryTerms) ||
            !primaryTerms.find((pt) => pt.id === term.id))
        );

      default:
        return false;
    }
  });

  if (!Array.isArray(termsInTax) || termsInTax.length === 0) return "";

  if (index < termsInTax.length) return termsInTax[index][`name_${lang}`] ?? "";

  return "";
};

const eventToArray = (event: any, lang: string) => {
  let pubState = "";

  if (event.status === PublishStatus.AUTODRAFT) {
    pubState = lang === "de" ? "Entwurf" : "Draft";
  } else if (event.status === PublishStatus.DRAFT) {
    pubState = lang === "de" ? "Entwurf" : "Draft";
  } else if (event.status === PublishStatus.FORREVIEW) {
    pubState = lang === "de" ? "Zur Kontrolle" : "For review";
  } else if (event.status === PublishStatus.REJECTED) {
    pubState = lang === "de" ? "Zurückgewiesen" : "Rejected";
  } else if (event.status === PublishStatus.IMPORTEDWARNINGS) {
    pubState =
      lang === "de" ? "Importiert mit Warnung(en)" : "Imported with warnings";
  } else if (event.status === PublishStatus.IMPORTED) {
    pubState = lang === "de" ? "Importiert" : "Imported";
  } else if (event.status === PublishStatus.PUBLISHED) {
    pubState = lang === "de" ? "Publiziert" : "Published";
  } else if (event.status === PublishStatus.TRASHED) {
    pubState = lang === "de" ? "Gelöscht" : "Trashed";
  } else {
    pubState = lang === "de" ? "Unbekannt" : "Unknown";
  }

  const getValue = (val: any) => {
    if (val) return `${val}`.trim() ?? "";
    return "";
  };

  const cols = [
    event.id,
    pubState,
    event.updatedAt,
    event.title_de,
    event.title_en,

    Array.isArray(event.locations) && event.locations.length > 0
      ? event.locations[0].id
      : "",
    Array.isArray(event.locations) && event.locations.length > 0
      ? event.locations[0].title_de
      : "",
    Array.isArray(event.locations) && event.locations.length > 0
      ? event.locations[0].title_en
      : "",

    htmlToText(event.description_de),
    htmlToText(event.description_en),
    `${getValue(event?.meta?.veranstalter?.name)}
    ${getValue(event?.meta?.veranstalter?.strasse)} ${getValue(
      event?.meta?.veranstalter?.hausnummer
    )}
    ${getValue(event?.meta?.veranstalter?.plz)} ${getValue(
      event?.meta?.veranstalter?.ort
    )}
    `.trim(),
    `${getValue(event?.meta?.veranstaltungsort?.name)}
    ${getValue(event?.meta?.veranstaltungsort?.strasse)} ${getValue(
      event?.meta?.veranstaltungsort?.hausnummer
    )}
    ${getValue(event?.meta?.veranstaltungsort?.plz)} ${getValue(
      event?.meta?.veranstaltungsort?.ort
    )}
    `.trim(),
    event?.meta?.event?.termine &&
    Object.keys(event?.meta?.event?.termine).length > 0
      ? Object.keys(event?.meta?.event?.termine)
          .reduce((out: string[], tId: any) => {
            const termin: any = event?.meta?.event?.termine[tId];

            out.push(
              `${termin.tag_von} ${termin.uhrzeit_von}-${termin.uhrzeit_bis},\n`
            );
            return out;
          }, [] as string[])
          .join("")
      : "",

    lang === "de"
      ? event.isFree
        ? "Ja"
        : "Nein"
      : event.isFree
      ? "Yes"
      : "No",

    getTermName("eventType", event.terms, 0, lang),
    getTermName("eventType", event.terms, 1, lang),
    getTermName("eventType", event.terms, 2, lang),
    getTermName("eventType", event.terms, 3, lang),
    getTermName("eventType", event.terms, 4, lang),
    getTermName("eventType", event.terms, 5, lang),
    getTermName("eventType", event.terms, 6, lang),
    getTermName("eventType", event.terms, 7, lang),
    getTermName("eventType", event.terms, 8, lang),
    getTermName("eventType", event.terms, 9, lang),

    event?.heroImage?.meta?.originalFileUrl ?? "",
  ];

  return cols;
};

const doChores = async () => {
  const args = minimist(process.argv.slice(2), {
    //string: ['tokenURI', 'metadataURI', 'contentHash', 'metadataHash'],
  });

  if (!args.exportId) throw new Error("please set an import id via --exportId");

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: `${apiConfig.db.url}&connection_limit=1`,
      },
    },
  });

  try {
    const exportInDb = await prisma.dataExport.findUnique({
      where: {
        id: args.exportId,
      },
      include: {
        file: true,
        owner: true,
      },
    });

    if (exportInDb && exportInDb?.owner?.id) {
      if (ExportStatus.PROCESS !== exportInDb.status ?? -1)
        throw Error("Status of import excludes it from processing");

      logger.info(`Export id: ${exportInDb.id} found to be valid for export`);

      let apiUser;
      try {
        apiUser = createApiUserFromUser(exportInDb?.owner);
      } catch (err: any) {
        throw err;
      }

      if (!apiUser || !apiUser.permissions.includes("eventReadOwn"))
        throw Error("Access denied");

      logger.info(`Export id: ${exportInDb.id} found to be valid for export`);

      let tax = await prisma.taxonomy.findFirst({
        where: {
          slug_de: "veranstaltungsart",
        },
      });

      if (tax && tax.id) {
        const terms = await prisma.term.findMany({
          where: {
            taxonomy: {
              id: tax.id,
            },
          },
        });

        if (terms) {
          termsEventType = terms.reduce((acc: any, t: any) => {
            return {
              ...acc,
              [t.id]: {
                de: t.name_de,
                en: t.name_en,
              },
            };
          }, {} as any);
        } else {
          throw Error(
            exportInDb.lang === "de"
              ? "Konnte die Begriffe der Taxonomie 'Veranstaltungsart' - Slug 'veranstaltungsart' nicht finden"
              : "Could not retrieve terms for 'Veranstaltungsart' - Slug 'veranstaltungsart'"
          );
        }
      }

      logger.debug(`Export id: ${exportInDb.id} terms loaded`);

      log.push(
        exportInDb.lang === "de"
          ? `Beginne export.`
          : `Starting to process export.`
      );
      await prisma.dataExport.update({
        data: {
          status: ExportStatus.PROCESSING,
          log,
          errors,
        },
        where: {
          id: exportInDb.id,
        },
      });

      try {
        const meta: any = exportInDb?.meta ?? {};

        if (!meta)
          throw Error(
            exportInDb.lang === "de"
              ? `Die Metadaten konnten nicht im Export gefunden werden`
              : `Meta data not found in Export`
          );

        let totalCount;
        let events: Prisma.Event[] = [];
        let include: Prisma.Prisma.EventInclude = {};
        let where: Prisma.Prisma.EventWhereInput = meta?.where ?? {};

        if (!apiUser.permissions.includes("eventRead")) {
          where = {
            ...where,
            owner: {
              id: apiUser?.id ?? 0,
            },
          };
        }

        totalCount = await prisma.event.count({
          where,
        });

        log.push(
          exportInDb.lang === "de"
            ? `Beginne den Export von ${totalCount} Veranstaltungen`
            : `Attempting to export query with ${totalCount} items`
        );
        logger.info(
          `Export id: ${exportInDb.id} attempting to export query with ${totalCount} item`
        );
        include = {
          ...include,
          locations: {
            select: {
              id: true,
              ...daoSharedGetTranslatedSelectColumns(["title"]),
            },
          },
          terms: {
            select: {
              id: true,
              ...daoSharedGetTranslatedSelectColumns(["name"]),
            },
          },
          primaryTerms: {
            select: {
              id: true,
              ...daoSharedGetTranslatedSelectColumns(["name"]),
            },
          },
          heroImage: true,
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
        };

        if (totalCount > 0) {
          events = await prisma.event.findMany({
            where,
            include,
            orderBy: meta?.orderBy ?? undefined,
          });

          if (events) {
            const filePath = `${apiConfig.baseDir}/${apiConfig.publicDir}/exports`;
            const nanoId = customNanoId();

            const fileName = `export-${nanoId}.xlsx`;

            if (fs.existsSync(filePath) === false) {
              fs.mkdirSync(filePath);
            }

            const writeStream = fs.createWriteStream(`${filePath}/${fileName}`);

            const workbook = new Excel.stream.xlsx.WorkbookWriter({
              stream: writeStream,
            });
            const worksheet = workbook.addWorksheet("Export");

            worksheet.addRow([
              "ID",
              exportInDb.lang === "de"
                ? "Publikations Status"
                : "Publish state",
              exportInDb.lang === "de"
                ? "Letzte Aktualisierung"
                : "Last update",
              exportInDb.lang === "de" ? "Titel (DE)" : "Title (DE)",
              exportInDb.lang === "de" ? "Titel (EN)" : "Title (EN)",
              exportInDb.lang === "de" ? "Kartenpunkt (ID)" : "Location (ID)",
              exportInDb.lang === "de"
                ? "Kartenpunkttitel (DE)"
                : "Location title (DE)",

              exportInDb.lang === "de"
                ? "Kartenpunkttitel (EN)"
                : "Location title (EN)",

              exportInDb.lang === "de"
                ? "Beschreibung (DE)"
                : "Description (DE)",
              exportInDb.lang === "de"
                ? "Beschreibung (EN)"
                : "Description (EN)",
              exportInDb.lang === "de" ? "Veranstalter" : "Organiser",
              exportInDb.lang === "de" ? "Veranstaltungsort" : "Event location",
              exportInDb.lang === "de" ? "Termine" : "Dates",
              exportInDb.lang === "de" ? "Eintritt Frei" : "Free Entry",
              exportInDb.lang === "de" ? "Veranstaltungsart 1" : "Event Type 1",
              exportInDb.lang === "de" ? "Veranstaltungsart 2" : "Event Type 2",
              exportInDb.lang === "de" ? "Veranstaltungsart 3" : "Event Type 3",
              exportInDb.lang === "de" ? "Veranstaltungsart 4" : "Event Type 4",
              exportInDb.lang === "de" ? "Veranstaltungsart 5" : "Event Type 5",
              exportInDb.lang === "de" ? "Veranstaltungsart 6" : "Event Type 6",
              exportInDb.lang === "de" ? "Veranstaltungsart 7" : "Event Type 7",
              exportInDb.lang === "de" ? "Veranstaltungsart 8" : "Event Type 8",
              exportInDb.lang === "de" ? "Veranstaltungsart 9" : "Event Type 9",
              exportInDb.lang === "de"
                ? "Veranstaltungsart 10"
                : "Event Type 10",

              exportInDb.lang === "de" ? "Poster Bild" : "Featured image",
            ]);

            for (let i = 0; i < events.length; i++) {
              worksheet
                .addRow(eventToArray(events[i], exportInDb.lang))
                .commit();
              log.push(
                exportInDb.lang === "de"
                  ? `Veranstaltung: ${events[i].id} bearbeitet`
                  : `Processed event id: ${events[i].id}`
              );
            }
            worksheet.commit();
            await workbook.commit();

            log.push(
              exportInDb.lang === "de" ? "Datei erstellt" : "File created"
            );
            logger.info(`Export id: ${exportInDb.id} file created`);
            const stats = fs.statSync(`${filePath}/${fileName}`);

            const file = await prisma.file.create({
              data: {
                nanoid: nanoId,
                owner: {
                  connect: {
                    id: exportInDb.owner.id,
                  },
                },
                meta: {
                  uploadFolder: "exports/",
                  originalFileName: fileName,
                  originalFileUrl: `${apiConfig.baseUrl.api}/exports/${fileName}`,
                  originalFilePath: `${filePath}/${fileName}`,
                  mimeType:
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                  size: stats.size,
                },
              },
            });
            log.push(
              exportInDb.lang === "de"
                ? "Datei in Datenbank registriert"
                : "File registered in database"
            );
            await prisma.dataExport.update({
              data: {
                status:
                  errors.length > 0
                    ? ExportStatus.ERROR
                    : ExportStatus.PROCESSED,
                log,
                errors,
                file: {
                  connect: {
                    id: file.id,
                  },
                },
              },
              where: {
                id: exportInDb.id,
              },
            });

            log.push(
              exportInDb.lang === "de" ? "Export beendet" : "Export finished"
            );
            logger.info(`Export id: ${exportInDb.id} done`);
          }
        }
      } catch (err) {
        throw err;
      }

      await prisma.dataExport.update({
        data: {
          status:
            errors.length > 0 ? ExportStatus.ERROR : ExportStatus.PROCESSED,
          log,
          errors,
        },
        where: {
          id: exportInDb.id,
        },
      });
      await prisma.$disconnect();
    } else {
      throw Error(
        exportInDb?.lang === "de"
          ? `Export hat keinen "owner" ${args.exportId}`
          : `No owner for export id ${args.exportId}`
      );
    }
  } catch (err: any) {
    const exportInDb = await prisma.dataExport.findUnique({
      where: {
        id: args.exportId,
      },
    });

    if (exportInDb) {
      errors.push(`${err.name} - ${err.message}`);
      await prisma.dataExport.update({
        data: {
          status: ExportStatus.ERROR,
          log,
          errors,
        },
        where: {
          id: exportInDb.id,
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
