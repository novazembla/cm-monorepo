import dotenv from "dotenv";

import { parse } from "@fast-csv/parse";
import { access } from "fs/promises";
import { createReadStream } from "fs";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";
import isEmail from "is-email";
import isUrl from "is-url";
import minimist from "minimist";
import hash from "object-hash";
import { customAlphabet } from "nanoid";
import pMap from "p-map";

import { getApiConfig } from "../config";
import {
  DataImportStatus,
  dataImportHeadersLocation,
  dataImportTaxonomyKeys,
  dataImportRequiredHeadersLocation,
  PublishStatus,
} from "@culturemap/core";

import logger from "../services/serviceLogging";
import { slugify, convertToHtml, awaitTimeout, parseSettings } from "../utils";

import {
  geocodingGetAddressCandidates,
  geocodingGetBestMatchingLocation,
} from "../utils/geocoding";

import { daoSharedGenerateFullText } from "../dao/shared";
let settings: any = {};
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

let termsType: any = {};
let termsTargetAudience: any = {};
let termsInstitutionType: any = {};

let lang = "en";

const trimString = (str: string, length: number) =>
  str.length > length ? str.substring(0, length - 3) + "..." : str;

const getTranslatedHeader = (key: string, language: string) => {
  return dataImportHeadersLocation?.[key]?.[language]
    ? `${dataImportHeadersLocation[key][language]}`
    : key;
};

const mapKeyToHeader = (mapping: any[], key: string) => {
  const match = mapping.find((m) => m.match === key);
  if (!match || !match.headerKey || !headers.includes(match.headerKey))
    return undefined;

  return match.headerKey;
};

const getTermsOfRow = (
  mapping: any[],
  row: any[],
  logWarnings: boolean,
  primaryTermKey?: string
) => {
  return dataImportTaxonomyKeys.reduce((acc, key) => {
    if (primaryTermKey && primaryTermKey !== key) return acc;

    const headerKey = mapKeyToHeader(mapping, key);

    if (!headerKey) return acc;

    const value =
      row[headerKey] && row[headerKey].trim() !== ""
        ? slugify(row[headerKey].trim().toLowerCase())
        : undefined;

    if (value) {
      let term;

      if (key.indexOf("tax-type") > -1) term = termsType[value];

      if (key.indexOf("tax-audience") > -1) term = termsTargetAudience[value];

      if (key.indexOf("tax-agency") > -1) term = termsInstitutionType[value];

      if (term?.id) {
        acc.push({
          id: term.id,
        });
      } else {
        if (logWarnings)
          warnings.push(
            lang === "de"
              ? `Unbekannter Begriff: "${row[headerKey]}" in Zeile #${
                  row["###" as any]
                } Spalte "${getTranslatedHeader(key, lang)}"`
              : `Unknown term: "${row[headerKey]}" in row #${
                  row["###" as any]
                } column "${getTranslatedHeader(key, lang)}"`
          );
      }
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

const keyExistsInRow = (mapping: any[], row: any[], key: string) => {
  try {
    const headerKey = mapKeyToHeader(mapping, key);

    return headerKey && row[headerKey];
  } catch (err) {}

  return false;
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

    if (titleDe === "" && titleEn !== "") titleDe = titleEn;

    if (titleEn === "" && titleDe !== "") titleEn = titleDe;

    if (!titleDe) {
      warnings.push(
        lang === "de"
          ? `Üebrspringe leere Zeile ${
              row["###" as any] ? `#${row["###" as any]}` : ""
            }`
          : `Skipping empty row ${
              row["###" as any] ? `#${row["###" as any]}` : ""
            }`
      );
      return;
    }

    const locationHash = hash({
      titleDe,
      titleEn,
    });

    let locationInDb = await prisma.location.findFirst({
      where: {
        importedLocationHash: locationHash,
      },
    });

    const evntLocationId = getRowValueOrEmptyString(
      mapping,
      row,
      "eventLocationId"
    );

    const primaryTerm = getTermsOfRow(mapping, row, false, "tax-type-1");
    let terms = getTermsOfRow(mapping, row, true);

    const getShareDataValue = (
      key: string,
      valueInDb: any,
      asHtml?: boolean
    ) => {
      if (keyExistsInRow(mapping, row, key)) {
        logger.info(`key exitst, ${key}`);
        if (asHtml) {
          logger.info(
            `html, ${convertToHtml(
              getRowValueOrEmptyString(mapping, row, key)
            )}`
          );
          return convertToHtml(getRowValueOrEmptyString(mapping, row, key));
        } else {
          logger.info(`non ${getRowValueOrEmptyString(mapping, row, key)}`);
          return getRowValueOrEmptyString(mapping, row, key);
        }
      } else {
        logger.info(`fallback, ${valueInDb}, ${""}`);
        return valueInDb ?? "";
      }
    };

    const sharedData = {
      title_de: titleDe,
      title_en: titleEn,
      slug_de: `${slugify(titleDe)}-de-${nanoid()}`,
      slug_en: `${slugify(titleEn)}-en-${nanoid()}`,
      agency: getShareDataValue("agency", locationInDb?.agency),
      eventLocationId: evntLocationId ? parseInt(evntLocationId) : undefined,
      address: {
        co: getShareDataValue("co", (locationInDb as any)?.address?.co),
        street1: getShareDataValue(
          "street1",
          (locationInDb as any)?.address?.street1
        ),
        street2: getShareDataValue(
          "street2",
          (locationInDb as any)?.address?.street2
        ),
        houseNumber: getShareDataValue(
          "houseNumber",
          (locationInDb as any)?.address?.houseNumber
        ),
        city: getShareDataValue("city", (locationInDb as any)?.address?.city),
        postCode: getShareDataValue(
          "postCode",
          (locationInDb as any)?.address?.postCode
        ),
      },
      contactInfo: {
        email1: getShareDataValue(
          "email1",
          (locationInDb as any)?.contactInfo?.email1
        ),
        email2: getShareDataValue(
          "email2",
          (locationInDb as any)?.contactInfo?.email2
        ),
        phone1: getShareDataValue(
          "phone1",
          (locationInDb as any)?.contactInfo?.phone1
        ),
        phone2: getShareDataValue(
          "phone2",
          (locationInDb as any)?.contactInfo?.phone2
        ),
      },
      socialMedia: {
        facebook: getShareDataValue(
          "facebook",
          (locationInDb as any)?.socialMedia.facebook
        ),
        twitter: getShareDataValue(
          "twitter",
          (locationInDb as any)?.socialMedia.twitter
        ),
        instagram: getShareDataValue(
          "instagram",
          (locationInDb as any)?.socialMedia.instagram
        ),
        youtube: getShareDataValue(
          "youtube",
          (locationInDb as any)?.socialMedia.youtube
        ),
        website: getShareDataValue(
          "website",
          (locationInDb as any)?.socialMedia.website
        ),
      },
      description_de: getShareDataValue(
        "description-de",
        locationInDb?.description_de,
        true
      ),
      description_en: getShareDataValue(
        "description-en",
        locationInDb?.description_en,
        true
      ),
      offers_de: getShareDataValue("offers-de", locationInDb?.offers_de, true),
      offers_en: getShareDataValue("offers-en", locationInDb?.offers_en, true),
      accessibilityInformation_de: getShareDataValue(
        "accessibility-de",
        locationInDb?.accessibilityInformation_de,
        true
      ),
      accessibilityInformation_en: getShareDataValue(
        "accessibility-en",
        locationInDb?.accessibilityInformation_en,
        true
      ),
      importedLocationHash: locationHash,
    };

    const socialMediaKeys = [
      "facebook",
      "twitter",
      "instagram",
      "youtube",
      "website",
    ];

    let hasWarnings = false;

    if (
      sharedData.contactInfo.email1 !== "" &&
      !isEmail(sharedData.contactInfo.email1)
    )
      hasWarnings = true;

    if (
      sharedData.contactInfo.email2 !== "" &&
      !isEmail(sharedData.contactInfo.email2)
    )
      hasWarnings = true;

    socialMediaKeys.forEach((key) => {
      const socialLinks = sharedData.socialMedia as any;

      if (socialLinks[key] !== "" && !isUrl(socialLinks[key]))
        hasWarnings = true;
    });

    if (Array.isArray(primaryTerm) && primaryTerm.length > 0) {
      terms = primaryTerm.reduce((acc: any, term: any) => {
        if (!acc.find((t: any) => t.id === term.id))
          acc.push({
            id: term.id,
          });
        return acc;
      }, terms);
    }

    if (locationInDb && locationInDb.id) {
      let data: any = {
        ...sharedData,
        terms: {
          set: terms,
        },
        ...(Array.isArray(primaryTerm) && primaryTerm.length > 0
          ? {
              primaryTerms: {
                set: {
                  id: primaryTerm[0].id,
                },
              },
            }
          : {}),
        fullText: daoSharedGenerateFullText(
          sharedData,
          [
            "title",
            "slug",
            "description",
            "offers",
            "accessibilityInformation",
          ],
          ["title", "slug", "description", "offers", "accessibilityInformation"]
        ),
      };
      const testAddress: any = locationInDb.address;
      if (
        testAddress.street1 !== data.address.street1 ||
        testAddress.houseNumber !== data.address.houseNumber ||
        testAddress.postCode !== data.address.postCode
      ) {
        const geoCodeCandidates = await geocodingGetAddressCandidates(
          sharedData.address,
          prisma
        );
        const point = geocodingGetBestMatchingLocation(
          geoCodeCandidates,
          sharedData.address.postCode
        );
        data = {
          ...data,
          lat: point.lat,
          lng: point.lng,
          geoCodingInfo: geoCodeCandidates,
        };
        hasWarnings = true;
        warnings.push(
          lang === "de"
            ? `Geocoding: Kartenpunkt ID: (${locationInDb?.id}) - Zeile #${
                row["###" as any]
              } die Addresse hat sich geändert bitte überprüfen Sie das Resultat`
            : `Geocoding: location ID: (${locationInDb?.id}) - row #${
                row["###" as any]
              } address change please check geo coding result`
        );
      }
      locationInDb = await prisma.location.update({
        data: {
          ...data,
          status: hasWarnings
            ? PublishStatus.IMPORTEDWARNINGS
            : PublishStatus.IMPORTED,
        },
        where: {
          id: locationInDb.id,
        },
      });

      if (locationInDb?.id) {
        log.push(
          lang === "de"
            ? `Kartenpunkt Id ${locationInDb.id} aktualisiert`
            : `Updated location id ${locationInDb.id}`
        );
      } else {
        errors.push(
          lang === "de"
            ? `Konnte neuen Kartenpunkt für "${data.title.de}" nicht erstellen`
            : `Failed to create new location ${data.title.de}`
        );
      }
    } else {
      const geoCodeCandidates = await geocodingGetAddressCandidates(
        sharedData.address,
        prisma
      );

      const point = geocodingGetBestMatchingLocation(
        geoCodeCandidates,
        sharedData.address.postCode
      );

      const data = {
        owner: {
          connect: {
            id: ownerId,
          },
        },
        ...sharedData,
        ...(terms && terms.length > 0
          ? {
              terms: {
                connect: terms,
              },
            }
          : {}),
        ...(Array.isArray(primaryTerm) && primaryTerm.length > 0
          ? {
              primaryTerms: {
                connect: {
                  id: primaryTerm[0].id,
                },
              },
            }
          : {}),
        lat: point.lat,
        lng: point.lng,
        geoCodingInfo: geoCodeCandidates,
      };

      if (!point || !point.lat || !point.lng) hasWarnings = true;

      locationInDb = await prisma.location.create({
        data: {
          ...data,
          status: hasWarnings
            ? PublishStatus.IMPORTEDWARNINGS
            : PublishStatus.IMPORTED,
          fullText: daoSharedGenerateFullText(
            data,
            [
              "title",
              "slug",
              "description",
              "offers",
              "accessibilityInformation",
            ],
            [
              "title",
              "slug",
              "description",
              "offers",
              "accessibilityInformation",
            ]
          ),
        },
      });

      if (locationInDb?.id) {
        log.push(
          lang === "de"
            ? `Neuer Kartenpunkt mit der ID ${locationInDb.id} erstellt`
            : `Created new location with id ${locationInDb.id}`
        );
        if (!point || !point.lat || !point.lng) {
          warnings.push(
            lang === "de"
              ? `Geocoding: Kartenpunkt ID: (${locationInDb?.id}) - Zeile #${
                  row["###" as any]
                } konnte Adresse nicht auflösen`
              : `Geocoding: Location ID: (${locationInDb?.id}) - row #${
                  row["###" as any]
                } could not find location on map`
          );
        }
      } else {
        errors.push(
          lang === "de"
            ? `Kartenpunkt für "${data.title_de}" konnte nicht erstellt werden`
            : `Failed to create new location ${data.title_de}`
        );
      }
    }

    // test validity of certain rows ..,
    if (
      sharedData.contactInfo.email1 !== "" &&
      !isEmail(sharedData.contactInfo.email1)
    )
      warnings.push(
        lang === "de"
          ? `Falsche Email Addresse: Kartenpunkt ID: (${
              locationInDb?.id
            }) - Zeile #${
              row["###" as any]
            } Email Addresse (1) ist nicht korrekt`
          : `Invalid email: location ID: (${locationInDb?.id}) - row #${
              row["###" as any]
            } Email (1) is not valid email address`
      );
    if (
      sharedData.contactInfo.email2 !== "" &&
      !isEmail(sharedData.contactInfo.email2)
    )
      warnings.push(
        lang === "de"
          ? `Falsche Email Addresse: Kartenpunkt ID: (${
              locationInDb?.id
            }) - Zeile #${
              row["###" as any]
            } Email Addresse (2) ist nicht korrekt`
          : `Invalid email: location ID: (${locationInDb?.id}) - row #${
              row["###" as any]
            } Email (2) is not valid email address`
      );

    socialMediaKeys.forEach((key) => {
      const socialLinks = sharedData.socialMedia as any;

      if (socialLinks[key] !== "" && !isUrl(socialLinks[key]))
        warnings.push(
          lang === "de"
            ? `Falsche URL: Kartenpunkt ID: (${locationInDb?.id}) - Zeile #${
                row["###" as any]
              } "${key}" ist keine URL`
            : `Invalid URL: location ID: (${locationInDb?.id}) - row #${
                row["###" as any]
              } "${key}" is not valid url`
        );
    });
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
        url: `${apiConfig.db.url}${
          apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
        }connection_limit=1`,
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

        const settingsInDb = await prisma.setting.findMany({
          where: {
            scope: "settings",
          },
          orderBy: {
            key: "asc",
          },
        });

        settings = parseSettings(settingsInDb);

        let tax = await prisma.taxonomy.findUnique({
          where: {
            id: parseInt(settings?.taxMapping?.typeOfInstitution ?? "0"),
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
              const name = slugify(t.name_de.trim().toLowerCase());
              return {
                ...acc,
                [name]: t,
              };
            }, {} as any);
          } else {
            throw Error(
              lang === "de"
                ? "Konnte die Begriffe der Taxonomie 'Einrichtungsart' - Slug 'einrichtungsart' nicht finden"
                : "Could not retrieve terms for 'Einrichtungsart' - Slug 'einrichtungsart'"
            );
          }
        }

        tax = await prisma.taxonomy.findUnique({
          where: {
            id: parseInt(settings?.taxMapping?.targetAudience ?? "0"),
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
              const name = slugify(t.name_de.trim().toLowerCase());
              return {
                ...acc,
                [name]: t,
              };
            }, {} as any);
          } else {
            throw Error(
              lang === "de"
                ? "Konnte die Begriffe der Taxonomie 'Angebote für' - Slug 'angebote-fuer' nicht finden"
                : "Could not retrieve terms for 'Angebote für' - Slug 'angebote-fuer'"
            );
          }
        }

        tax = await prisma.taxonomy.findUnique({
          where: {
            id: parseInt(settings?.taxMapping?.typeOfOrganisation ?? "0"),
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
              const name = slugify(t.name_de.trim().toLowerCase());
              return {
                ...acc,
                [name]: t,
              };
            }, {} as any);
          } else {
            throw Error(
              lang === "de"
                ? "Konnte die Begriffe der Taxonomie 'Trägerart' - Slug 'traegerart' nicht finden"
                : "Could not retrieve terms for 'Trägerart' - Slug 'traegerart'"
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

                    const k = Object.keys(dataImportHeadersLocation).find(
                      (iHk) => {
                        const t = Object.keys(
                          dataImportHeadersLocation[iHk]
                        ).find((lng) => {
                          return (
                            dataImportHeadersLocation[iHk][
                              lng
                            ].toLowerCase() === hTrimmed.toLowerCase()
                          );
                        });
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

                  // const requiredHeadersCheck = Object.keys(
                  //   dataImportRequiredHeadersLocation
                  // ).reduce((agg, rhKey) => {
                  //   return {
                  //     ...agg,
                  //     [rhKey]: !!dataImportRequiredHeadersLocation[rhKey].find((key) =>
                  //       mappedHeaders.includes(key)
                  //     ),
                  //   };
                  // }, {} as any);

                  // Object.keys(requiredHeadersCheck).forEach((key) => {
                  //   if (!requiredHeadersCheck[key]) {
                  //     const keys = dataImportRequiredHeadersLocation[key].map((k) => {
                  //       return dataImportHeadersLocation[k][lang];
                  //     });
                  //     warnings.push(
                  //       lang === "de"
                  //         ? `Konnte verpflichtende Spalte(n) "${keys.join(
                  //             '" or "'
                  //           )}" nicht in der CSV-Datei finden`
                  //         : `Required column "${keys.join(
                  //             '" or "'
                  //           )}" not found in CSV.`
                  //     );
                  //   }
                  // });

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
                  Object.keys(dataImportRequiredHeadersLocation).length
              ) {
                errors.push(
                  lang === "de"
                    ? `Die hochgeladene Datei enthält weniger Spalten als die Anzahl der verpflichtenden Spalten. Bitte laden Sie nur Dateien mit mindestens ${
                        Object.keys(dataImportRequiredHeadersLocation).length
                      } Spalten, sowie einer Laufnummerspalte hoch`
                    : `The uploaded CSV did not contain the minimum number of columns. Please ensure to only upload documents that contain at least ${
                        Object.keys(dataImportRequiredHeadersLocation).length
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
                  ? `Importierung beendet: ${rowCount} Zeilen bearbeitet`
                  : `Import done: processed ${rowCount} rows`
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
            await awaitTimeout(apiConfig.geoCodingThrottle);
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
