import { DataImport } from "@prisma/client";
import { parse } from "@fast-csv/parse";
import httpStatus from "http-status";
import { access } from "fs/promises";
import { createReadStream } from "fs";
import {
  dataImportHeadersLocation,
  dataImportRequiredHeadersLocation,
  dataImportHeadersEvent,
  dataImportRequiredHeadersEvent,
  DataImportStatus,
  DataImportHeaders,
  DataImportRequiredHeaders,
} from "@culturemap/core";
import { ApiError } from "../utils";
import { logger } from "./serviceLogging";
import {
  daoDataImportGetById,
  daoFileSetToDelete,
  daoDataImportDelete,
} from "../dao";

const trimString = (str: string, length: number) =>
  str.length > length ? str.substring(0, length - 3) + "..." : str;

export const dataImportParseInitialCsv = async (
  type: string,
  file: string,
  numRows: number,
  lang: string
) => {
  const log: any[] = [];
  const errors: any[] = [];
  const warnings: any[] = [];
  const rows: any[] = [];
  let mapping: any[] = [];
  let headers: any[] = [];
  let headersUnparsed: any = {};
  let unknownHeadersCounter = 0;
  let missingRequiredHeadersCounter = 0;

  let importHeaders: DataImportHeaders = {},
    requiredImportHeaders: DataImportRequiredHeaders = {};

  if (type === "location") {
    importHeaders = dataImportHeadersLocation;
    requiredImportHeaders = dataImportRequiredHeadersLocation;
  }
  if (type === "event") {
    importHeaders = dataImportHeadersEvent;
    requiredImportHeaders = dataImportRequiredHeadersEvent;
  }

  try {
    if (
      Object.keys(importHeaders).length === 0 ||
      Object.keys(requiredImportHeaders).length === 0
    )
      throw Error(`Import header definitions not found for type ${type}`);

    await access(file);

    await new Promise((resolve, reject) => {
      createReadStream(file)
        .pipe(
          parse({
            strictColumnHandling: true,
            delimiter: ";",
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
                  const t = Object.keys(importHeaders[iHk]).find((lng) => {
                    return (
                      importHeaders[iHk][lng].toLowerCase() ===
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
                  warnings.push(
                    lang === "de"
                      ? `Unbekannte Spaltenüberschrift "${h}" bitte bestimmen Sie eine Zielspalte in der Datenbank`
                      : `Unknown column header "${h}" please assign tagret database column`
                  );

                  const uKey = `unkown-${unknownHeadersCounter}`;
                  headersUnparsed[uKey] = hTrimmed;
                  return uKey;
                }
              });

              const requiredHeadersCheck = Object.keys(
                requiredImportHeaders
              ).reduce((agg, rhKey) => {
                return {
                  ...agg,
                  [rhKey]: !!requiredImportHeaders[rhKey].find((key) =>
                    mappedHeaders.includes(key)
                  ),
                };
              }, {} as any);

              Object.keys(requiredHeadersCheck).forEach((key) => {
                if (!requiredHeadersCheck[key]) {
                  missingRequiredHeadersCounter += 1;
                  const keys = requiredImportHeaders[key].map((k) => {
                    return importHeaders[k][lang];
                  });
                  warnings.push(
                    lang === "de"
                      ? `Konnte verpflichtende Spalte(n) "${keys.join(
                          '" or "'
                        )}" nicht in der CSV-Datei finden`
                      : `Required column "${keys.join(
                          '" or "'
                        )}" not found in CSV.`
                  );
                }
              });

              return mappedHeaders;
            },
            ignoreEmpty: true,
            maxRows: Number.isNaN(numRows) ? 0 : numRows,
          })
        )
        .on("error", (error) => {
          logger.info(`dataImportParseInitialCsv() ${error.message}§`);
          reject(error);
        })
        .on("headers", (hdrs) => {
          headers = hdrs;

          if (
            !Array.isArray(headers) ||
            headers.length - 1 < Object.keys(requiredImportHeaders).length
          ) {
            errors.push(
              lang === "de"
                ? `Die hochgeladene Datei enthält weniger Spalten als die Anzahl der verpflichtenden Spalten. Bitte laden Sie nur Dateien mit mindestens ${
                    Object.keys(requiredImportHeaders).length
                  } Spalten, sowie einer Laufnummerspalte hoch`
                : `The uploaded CSV did not contain the minimum number of columns. Please ensure to only upload documents that contain at least ${
                    Object.keys(requiredImportHeaders).length
                  } content columns and one ID column`
            );
          }
        })
        .on("data-invalid", (row) => {
          errors.push(
            lang === "de"
              ? `Fehler in Zeile:  ${trimString(JSON.stringify(row), 120)}`
              : `Invalid row ${trimString(JSON.stringify(row), 120)}`
          );
        })
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", (rowCount: number) => {
          log.push(
            lang === "de"
              ? `Die ersten ${rowCount} Zeilen wurden erfolgreich eingelesen`
              : `Parsed first ${rowCount} rows`
          );
          logger.debug(`Parsed first ${rowCount} rows`);
          resolve(true);
        });
    });
  } catch (err: any) {
    errors.push(err.message);
  }

  if (headers.length === 0)
    errors.push(
      lang === "de"
        ? `Konnte Spaltenüberschriften nicht finden`
        : "Headers have not been found"
    );

  if (rows.length === 0)
    errors.push(
      lang === "de" ? `Keinen Datenzeilen gefunden` : "No data row(s) found"
    );

  if (headers.length > 0 && rows.length) {
    if (headers.length === Object.keys(rows[0]).length) {
      mapping = headers.reduce((agg, col) => {
        if (headersUnparsed[col] === "###") return agg;

        agg.push({
          header: headersUnparsed[col],
          headerKey: col,
          row: rows[0][col],
          match: col,
        });
        return agg;
      }, [] as any[]);
    } else {
      errors.push(
        lang === "de"
          ? `Die Anzahl der Spaltenüberschriften stimmt nicht mit der Anzahl der Datenspalten überein`
          : "Headers and rows column count do not match"
      );
    }
  }

  logger.info(`dataImportParseInitialCsv() parsed ${file}`);
  logger.info(
    `dataImportParseInitialCsv() Headers:${headers.length} Errors:${errors.length} MissingHeaders:${missingRequiredHeadersCounter} UnknownHeaders:${unknownHeadersCounter} Rows:${rows.length}`
  );
  if (errors.length) logger.info(errors);

  return {
    missingRequiredHeadersCounter,
    unknownHeadersCounter,
    log,
    warnings,
    errors,
    mapping,
  };
};

export const dataImportDelete = async (id: number): Promise<DataImport> => {
  const importInDb: DataImport = await daoDataImportGetById(id);

  if (!importInDb)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "DataImport could not be deleted"
    );

  if (importInDb.status === DataImportStatus.PROCESSING)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "DataImport could not be deleted"
    );

  if (importInDb?.fileId) daoFileSetToDelete(importInDb?.fileId);

  return daoDataImportDelete(id);
};

export default dataImportParseInitialCsv;
