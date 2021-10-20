import dotenv from "dotenv";
import fs from "fs";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";
import minimist from "minimist";

import { getApiConfig } from "../config";
import {
  DataExportStatus,
  PublishStatus,
  dataImportHeadersLocation,
} from "@culturemap/core";
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

let termsType: any = {};
let termsTargetAudience: any = {};
let termsInstitutionType: any = {};

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
      case "type":
        return (
          typeof termsType[term.id] !== "undefined" &&
          (!Array.isArray(primaryTerms) ||
            !primaryTerms.find((pt) => pt.id === term.id))
        );

      case "targetAudience":
        return (
          typeof termsTargetAudience[term.id] !== "undefined" &&
          (!Array.isArray(primaryTerms) ||
            !primaryTerms.find((pt) => pt.id === term.id))
        );

      case "institutionType":
        return (
          typeof termsInstitutionType[term.id] !== "undefined" &&
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

const locationToArray = (location: any, lang: string) => {
  let pubState = "";

  if (location.status === PublishStatus.AUTODRAFT) {
    pubState = lang === "de" ? "Entwurf" : "Draft";
  } else if (location.status === PublishStatus.DRAFT) {
    pubState = lang === "de" ? "Entwurf" : "Draft";
  } else if (location.status === PublishStatus.FORREVIEW) {
    pubState = lang === "de" ? "Zur Kontrolle" : "For review";
  } else if (location.status === PublishStatus.REJECTED) {
    pubState = lang === "de" ? "Zurückgewiesen" : "Rejected";
  } else if (location.status === PublishStatus.IMPORTEDWARNINGS) {
    pubState =
      lang === "de"
        ? "DataImportiert mit Warnung(en)"
        : "DataImported with warnings";
  } else if (location.status === PublishStatus.IMPORTED) {
    pubState = lang === "de" ? "DataImportiert" : "DataImported";
  } else if (location.status === PublishStatus.PUBLISHED) {
    pubState = lang === "de" ? "Publiziert" : "Published";
  } else if (location.status === PublishStatus.TRASHED) {
    pubState = lang === "de" ? "Gelöscht" : "Trashed";
  } else {
    pubState = lang === "de" ? "Unbekannt" : "Unknown";
  }

  const cols = [
    location.id,
    pubState,
    location.updatedAt,
    location.lng,
    location.lat,
    location.title_de,
    location.title_en,
    location.agency,
    getTermName("institutionType", location.terms, 0, lang),
    getTermName("institutionType", location.terms, 1, lang),

    getTermName("type", location.primaryTerms, 0, lang),
    getTermName("type", location.terms, 0, lang, location.primaryTerms),
    getTermName("type", location.terms, 1, lang, location.primaryTerms),
    getTermName("type", location.terms, 2, lang, location.primaryTerms),
    getTermName("type", location.terms, 3, lang, location.primaryTerms),

    getTermName("targetAudience", location.terms, 0, lang),
    getTermName("targetAudience", location.terms, 1, lang),
    getTermName("targetAudience", location.terms, 2, lang),
    getTermName("targetAudience", location.terms, 3, lang),

    location?.address?.co ?? "",
    location?.address?.street1 ?? "",
    location?.address?.street2 ?? "",
    location?.address?.houseNumber ?? "",
    location?.address?.postCode ?? "",
    location?.address?.city ?? "",
    location?.contactInfo?.phone1 ?? "",
    location?.contactInfo?.phone2 ?? "",
    location?.contactInfo?.email1 ?? "",
    location?.contactInfo?.email2 ?? "",
    htmlToText(location.description_de ?? ""),
    htmlToText(location.description_en ?? ""),
    htmlToText(location.offers_de ?? ""),
    htmlToText(location.offers_en ?? ""),
    htmlToText(location.accessibilityInformation_de ?? ""),
    htmlToText(location.accessibilityInformation_en ?? ""),

    location?.socialMedia?.website ?? "",
    location?.socialMedia?.facebook ?? "",
    location?.socialMedia?.instagram ?? "",
    location?.socialMedia?.twitter ?? "",
    location?.socialMedia?.youtube ?? "",
    location?.eventLocationId ?? "",

    location?.heroImage?.meta?.originalFileUrl ?? "",
    location?.images && location.images.length > 0
      ? location.images[0]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 1
      ? location.images[1]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 2
      ? location.images[2]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 3
      ? location.images[3]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 4
      ? location.images[4]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 5
      ? location.images[5]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 6
      ? location.images[6]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 7
      ? location.images[7]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 8
      ? location.images[8]?.meta?.originalFileUrl
      : "",
    location?.images && location.images.length > 9
      ? location.images[9]?.meta?.originalFileUrl
      : "",
  ];

  return cols;
};

const getTranslatedHeader = (key: string, lang: string) => {
  try {
    return dataImportHeadersLocation[key][lang];
  } finally {
    return key;
  }
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
      if (DataExportStatus.PROCESS !== exportInDb.status ?? -1)
        throw Error("Status of import excludes it from processing");

      logger.info(`Export id: ${exportInDb.id} found to be valid for export`);

      let apiUser;
      try {
        apiUser = createApiUserFromUser(exportInDb?.owner);
      } catch (err: any) {
        throw err;
      }

      if (!apiUser || !apiUser.permissions.includes("locationReadOwn"))
        throw Error("Access denied");

      logger.info(`Export id: ${exportInDb.id} found to be valid for export`);

      let tax = await prisma.taxonomy.findFirst({
        where: {
          slug_de: "einrichtungsart",
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
          termsType = terms.reduce((acc: any, t: any) => {
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
              ? "Konnte die Begriffe der Taxonomie 'Einrichtungsart' - Slug 'einrichtungsart' nicht finden"
              : "Could not retrieve terms for 'Einrichtungsart' - Slug 'einrichtungsart'"
          );
        }
      }

      tax = await prisma.taxonomy.findFirst({
        where: {
          slug_de: "zielgruppe",
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
          termsTargetAudience = terms.reduce((acc: any, t: any) => {
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
              ? "Konnte die Begriffe der Taxonomie 'Zielgruppe' - Slug 'zielgruppe' nicht finden"
              : "Could not retrieve terms for 'Zielgruppe' - Slug 'zielgruppe'"
          );
        }
      }

      logger.debug(`Export id: ${exportInDb.id} terms loaded`);

      tax = await prisma.taxonomy.findFirst({
        where: {
          slug_de: "traegerart",
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
          termsInstitutionType = terms.reduce((acc: any, t: any) => {
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
              ? "Konnte die Begriffe der Taxonomie 'Trägerart' - Slug 'traegerart' nicht finden"
              : "Could not retrieve terms for 'Trägerart' - Slug 'traegerart'"
          );
        }
      }

      log.push(
        exportInDb.lang === "de"
          ? `Beginne export.`
          : `Starting to process export.`
      );
      await prisma.dataExport.update({
        data: {
          status: DataExportStatus.PROCESSING,
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
        let locations: Prisma.Location[] = [];
        let include: Prisma.Prisma.LocationInclude = {};
        let where: Prisma.Prisma.LocationWhereInput = meta?.where ?? {};

        if (!apiUser.permissions.includes("locationRead")) {
          where = {
            ...where,
            owner: {
              id: apiUser?.id ?? 0,
            },
          };
        }

        totalCount = await prisma.location.count({
          where,
        });

        log.push(
          exportInDb.lang === "de"
            ? `Beginne den Export von ${totalCount} Kartenpunkten`
            : `Attempting to export query with ${totalCount} items`
        );
        logger.info(
          `Export id: ${exportInDb.id} attempting to export query with ${totalCount} item`
        );
        include = {
          ...include,
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
          images: true,
        };

        if (totalCount > 0) {
          locations = await prisma.location.findMany({
            where,
            include,
            orderBy: meta?.orderBy ?? undefined,
          });

          if (locations) {
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
              exportInDb.lang === "de" ? "Längengrad" : "Longitude",
              exportInDb.lang === "de" ? "Breitengrad" : "Latitude",
              getTranslatedHeader("title-de", exportInDb.lang),
              getTranslatedHeader("title-en", exportInDb.lang),
              getTranslatedHeader("agency", exportInDb.lang),
              getTranslatedHeader("tax-agency-type-1", exportInDb.lang),
              getTranslatedHeader("tax-agency-type-2", exportInDb.lang),
              getTranslatedHeader("tax-type-1", exportInDb.lang),
              getTranslatedHeader("tax-type-2", exportInDb.lang),
              getTranslatedHeader("tax-type-3", exportInDb.lang),
              getTranslatedHeader("tax-type-4", exportInDb.lang),
              getTranslatedHeader("tax-type-5", exportInDb.lang),
              getTranslatedHeader("tax-audience-1", exportInDb.lang),
              getTranslatedHeader("tax-audience-2", exportInDb.lang),
              getTranslatedHeader("tax-audience-3", exportInDb.lang),
              getTranslatedHeader("tax-audience-4", exportInDb.lang),
              getTranslatedHeader("co", exportInDb.lang),
              getTranslatedHeader("street1", exportInDb.lang),
              getTranslatedHeader("street2", exportInDb.lang),
              getTranslatedHeader("houseNumber", exportInDb.lang),
              getTranslatedHeader("postCode", exportInDb.lang),
              getTranslatedHeader("city", exportInDb.lang),
              getTranslatedHeader("phone1", exportInDb.lang),
              getTranslatedHeader("phone2", exportInDb.lang),
              getTranslatedHeader("email1", exportInDb.lang),
              getTranslatedHeader("email2", exportInDb.lang),
              getTranslatedHeader("description-de", exportInDb.lang),
              getTranslatedHeader("description-en", exportInDb.lang),
              getTranslatedHeader("offers-de", exportInDb.lang),
              getTranslatedHeader("offers-en", exportInDb.lang),
              getTranslatedHeader("accessibility-de", exportInDb.lang),
              getTranslatedHeader("accessibility-en", exportInDb.lang),
              getTranslatedHeader("website", exportInDb.lang),
              getTranslatedHeader("facebook", exportInDb.lang),
              getTranslatedHeader("instagram", exportInDb.lang),
              getTranslatedHeader("twitter", exportInDb.lang),
              getTranslatedHeader("youtube", exportInDb.lang),
              getTranslatedHeader("eventLocationId", exportInDb.lang),
              exportInDb.lang === "de" ? "Poster Bild" : "Featured image",
              exportInDb.lang === "de" ? "Bilder (1)" : "Further images (1)",
              exportInDb.lang === "de" ? "Bilder (2)" : "Further images (2)",
              exportInDb.lang === "de" ? "Bilder (3)" : "Further images (3)",
              exportInDb.lang === "de" ? "Bilder (4)" : "Further images (4)",
              exportInDb.lang === "de" ? "Bilder (5)" : "Further images (5)",
              exportInDb.lang === "de" ? "Bilder (6)" : "Further images (6)",
              exportInDb.lang === "de" ? "Bilder (7)" : "Further images (7)",
              exportInDb.lang === "de" ? "Bilder (8)" : "Further images (8)",
              exportInDb.lang === "de" ? "Bilder (9)" : "Further images (9)",
              exportInDb.lang === "de" ? "Bilder (10)" : "Further images (10)",
            ]);

            for (let i = 0; i < locations.length; i++) {
              worksheet
                .addRow(locationToArray(locations[i], exportInDb.lang))
                .commit();
              log.push(
                exportInDb.lang === "de"
                  ? `Kartenpunkt: ${locations[i].id} bearbeitet`
                  : `Processed location id: ${locations[i].id}`
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
                    ? DataExportStatus.ERROR
                    : DataExportStatus.PROCESSED,
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
            errors.length > 0
              ? DataExportStatus.ERROR
              : DataExportStatus.PROCESSED,
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
          status: DataExportStatus.ERROR,
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
