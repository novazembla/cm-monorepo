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
  ImportStatus,
  importHeaders,
  importRequiredHeaders,
  PublishStatus,
} from "@culturemap/core";

import logger from "../services/serviceLogging";
import { slugify, convertToHtml, awaitTimeout } from "../utils";

import {
  geocodingGetAddressCandidates,
  geocodingGetBestMatchingLocation,
} from "../utils/geocoding";

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

const trimString = (str: string, length: number) =>
  str.length > length ? str.substring(0, length - 3) + "..." : str;

const mapKeyToHeader = (mapping: any[], key: string) => {
  const match = mapping.find((m) => m.match === key);
  if (!match || !match.headerKey || !headers.includes(match.headerKey))
    return undefined;

  return match.headerKey;
};
const getTermsOfRow = (mapping: any[], row: any[], primaryTermKey?: string) => {
  const keys = [
    "tax-agency-type-1",
    "tax-agency-type-2",
    "tax-type-1",
    "tax-type-2",
    "tax-type-3",
    "tax-type-4",
    "tax-type-5",
    "tax-audience-1",
    "tax-audience-2",
    "tax-audience-3",
    "tax-audience-4",
  ];

  return keys.reduce((acc, key) => {
    if (primaryTermKey && primaryTermKey !== key) return acc;

    const headerKey = mapKeyToHeader(mapping, key);

    if (!headerKey) return acc;

    const value =
      row[headerKey] && row[headerKey].trim() !== ""
        ? row[headerKey].trim().toLowerCase()
        : undefined;

    if (value) {
      let term;

      if (key.indexOf("tax-type") > -1) term = termsType[value];

      if (key.indexOf("tax-audience") > -1) term = termsTargetAudience[value];

      if (key.indexOf("tax-agency") > -1) term = termsInstitutionType[value];

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

const processImportedRow = async (
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

    const primaryTerm = getTermsOfRow(mapping, row, "tax-type-1");
    let terms = getTermsOfRow(mapping, row);

    const sharedData = {
      title: {
        de: titleDe,
        en: titleEn,
      },
      slug: {
        de: `${slugify(titleDe)}-de-${nanoid()}`,
        en: `${slugify(titleEn)}-en-${nanoid()}`,
      },
      agency: getRowValueOrEmptyString(mapping, row, "agency"),
      eventLocationId: evntLocationId ? parseInt(evntLocationId) : undefined,
      address: {
        co: getRowValueOrEmptyString(mapping, row, "co"),
        street1: getRowValueOrEmptyString(mapping, row, "street1"),
        street2: getRowValueOrEmptyString(mapping, row, "street2"),
        houseNumber: getRowValueOrEmptyString(mapping, row, "houseNumber"),
        city: getRowValueOrEmptyString(mapping, row, "city"),
        postCode: getRowValueOrEmptyString(mapping, row, "postCode"),
      },
      contactInfo: {
        email1: getRowValueOrEmptyString(mapping, row, "email1"),
        email2: getRowValueOrEmptyString(mapping, row, "email2"),
        phone1: getRowValueOrEmptyString(mapping, row, "phone1"),
        phone2: getRowValueOrEmptyString(mapping, row, "phone2"),
      },
      socialMedia: {
        facebook: getRowValueOrEmptyString(mapping, row, "facebook"),
        twitter: getRowValueOrEmptyString(mapping, row, "twitter"),
        instagram: getRowValueOrEmptyString(mapping, row, "instagram"),
        youtube: getRowValueOrEmptyString(mapping, row, "youtube"),
        website: getRowValueOrEmptyString(mapping, row, "website"),
      },
      description: {
        de: convertToHtml(
          getRowValueOrEmptyString(mapping, row, "description-de")
        ),
        en: convertToHtml(
          getRowValueOrEmptyString(mapping, row, "description-en")
        ),
      },
      offers: {
        de: convertToHtml(getRowValueOrEmptyString(mapping, row, "offers-de")),
        en: convertToHtml(getRowValueOrEmptyString(mapping, row, "offers-en")),
      },
      accessibilityInformation: {
        de: convertToHtml(
          getRowValueOrEmptyString(mapping, row, "accessibility-de")
        ),
        en: convertToHtml(
          getRowValueOrEmptyString(mapping, row, "accessibility-en")
        ),
      },
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
          `Geocoding: location ID: (${locationInDb?.id}) - row# ${
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
        log.push(`Updated location id ${locationInDb.id}`);
      } else {
        errors.push(`Failed to create new location ${data.title.de}`);
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
        },
      });

      if (locationInDb?.id) {
        log.push(`Created new location with id ${locationInDb.id}`);
        if (!point || !point.lat || !point.lng) {
          warnings.push(
            `Geocoding: Location ID: (${locationInDb?.id}) - row# ${
              row["###" as any]
            } could not find location on map`
          );
        }
      } else {
        errors.push(`Failed to create new location ${data.title.de}`);
      }
    }

    // test validity of certain rows ..,
    if (
      sharedData.contactInfo.email1 !== "" &&
      !isEmail(sharedData.contactInfo.email1)
    )
      warnings.push(
        `Invalid email: location ID: (${locationInDb?.id}) - row# ${
          row["###" as any]
        } Email (1) is not valid email address`
      );
    if (
      sharedData.contactInfo.email2 !== "" &&
      !isEmail(sharedData.contactInfo.email2)
    )
      warnings.push(
        `Invalid email: location ID: (${locationInDb?.id}) - row# ${
          row["###" as any]
        } Email (2) is not valid email address`
      );

    socialMediaKeys.forEach((key) => {
      const socialLinks = sharedData.socialMedia as any;

      if (socialLinks[key] !== "" && !isUrl(socialLinks[key]))
        warnings.push(
          `Invalid URL: location ID: (${locationInDb?.id}) - row# ${
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
        url: `${apiConfig.db.url}&connection_limit=1`,
      },
    },
  });

  try {
    const importInDb = await prisma.import.findUnique({
      where: {
        id: args.importId,
      },
      include: {
        file: true,
        owner: true,
      },
    });

    if (importInDb) {
      // TODO: change to
      // if (![ImportStatus.PROCESS].includes(importInDb.status ?? -1))
      //   throw Error("Status of import excludes it from processing");

      const file = (importInDb?.file?.meta as any)?.originalFilePath;
      if (!file) throw Error(`No file uploaded for import id ${args.importId}`);

      if (!importInDb?.owner?.id)
        throw Error(`No owner for import id ${args.importId}`);

      log.push(`Starting to process import.`);
      await prisma.import.update({
        data: {
          status: ImportStatus.PROCESSING,
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
          throw Error("mapping could not be retrieved from db");

        // is the file readable?
        await access(file);

        let tax = await prisma.taxonomy.findFirst({
          where: {
            slug: {
              path: ["de"],
              string_contains: "einrichtungsart",
            },
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
              const name = t?.name?.de?.toLowerCase();
              return {
                ...acc,
                [name]: t,
              };
            }, {} as any);
          } else {
            throw Error(
              "Could not retrieve terms for 'Einrichtungsart' - Slug 'einrichtungsart'"
            );
          }
        }

        tax = await prisma.taxonomy.findFirst({
          where: {
            slug: {
              path: ["de"],
              string_contains: "zielgruppe",
            },
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
              const name = t?.name?.de?.toLowerCase();
              return {
                ...acc,
                [name]: t,
              };
            }, {} as any);
          } else {
            throw Error(
              "Could not retrieve terms for 'Zielgruppe' - Slug 'zielgruppe'"
            );
          }
        }

        tax = await prisma.taxonomy.findFirst({
          where: {
            slug: {
              path: ["de"],
              string_contains: "traegerart",
            },
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
              const name = t?.name?.de?.toLowerCase();
              return {
                ...acc,
                [name]: t,
              };
            }, {} as any);
          } else {
            throw Error(
              "Could not retrieve terms for 'Trägerart' - Slug 'traegerart'"
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

                    const k = Object.keys(importHeaders).find((iHk) => {
                      const t = Object.keys(importHeaders[iHk]).find((lang) => {
                        return (
                          importHeaders[iHk][lang].toLowerCase() ===
                          hTrimmed.toLowerCase()
                        );
                      });
                      return !!t;
                    });

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

                  const requiredHeadersCheck = Object.keys(
                    importRequiredHeaders
                  ).reduce((agg, rhKey) => {
                    return {
                      ...agg,
                      [rhKey]: !!importRequiredHeaders[rhKey].find((key) =>
                        mappedHeaders.includes(key)
                      ),
                    };
                  }, {} as any);

                  Object.keys(requiredHeadersCheck).forEach((key) => {
                    if (!requiredHeadersCheck[key]) {
                      const keys = importRequiredHeaders[key].map((k) => {
                        return importHeaders[k].en;
                      });
                      warnings.push(
                        `Required column "${keys.join(
                          '" or "'
                        )}" not found in CSV.`
                      );
                    }
                  });

                  return mappedHeaders;
                },
                ignoreEmpty: true,
              })
            )
            .on("error", (error) => {
              logger.info(`processImportFile() ${error.message}§`);
              reject(error);
            })
            .on("headers", (hdrs) => {
              headers = hdrs;

              if (
                !Array.isArray(headers) ||
                headers.length - 1 < Object.keys(importRequiredHeaders).length
              ) {
                errors.push(
                  `The uploaded CSV did not contain the minimum number of columns. Please ensure to only upload documents that contain at least ${
                    Object.keys(importRequiredHeaders).length
                  } content columns and one ID column`
                );
              }
            })
            .on("data-invalid", (row) => {
              warnings.push(
                `Invalid row ${trimString(JSON.stringify(row), 120)}`
              );
            })
            .on("data", async (row) => {
              rows.push(row);
            })
            .on("end", (rowCount: number) => {
              log.push(`Import done: processed ${rowCount} rows`);
              logger.debug(`Import done: processed ${rowCount} rows`);
              resolve(true);
            });
        });

        const processPMappedRow = async (row: any[]) => {
          try {
            await processImportedRow(
              prisma,
              mapping as any[],
              row,
              importInDb?.owner?.id
            );
            await prisma.import.update({
              data: {
                status:
                  errors.length > 0
                    ? ImportStatus.ERROR
                    : ImportStatus.PROCESSED,
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
      throw Error(`Import id:${args.importId} not found`);
    }

    await prisma.import.update({
      data: {
        status: errors.length > 0 ? ImportStatus.ERROR : ImportStatus.PROCESSED,
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
    const importInDb = await prisma.import.findUnique({
      where: {
        id: args.importId,
      },
    });

    if (importInDb) {
      errors.push(`${err.name} - ${err.message}`);
      await prisma.import.update({
        data: {
          status: ImportStatus.ERROR,
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
