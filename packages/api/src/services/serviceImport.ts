import { Import } from "@prisma/client";
import { parse } from "@fast-csv/parse";
import httpStatus from "http-status";
import { access } from "fs/promises";
import { createReadStream } from "fs";
import {
  importHeaders,
  importRequiredHeaders,
  ImportStatus,
} from "@culturemap/core";
import { ApiError } from "../utils";
import { logger } from "./serviceLogging";
import { daoImportGetById, daoFileSetToDelete, daoImportDelete } from "../dao";

const trimString = (str: string, length: number) =>
  str.length > length ? str.substring(0, length - 3) + "..." : str;

export const importParseInitialCsv = async (file: string, numRows: number) => {
  const log: any[] = [];
  const errors: any[] = [];
  const warnings: any[] = [];
  const rows: any[] = [];
  let mapping: any[] = [];
  let headers: any[] = [];
  let headersUnparsed: any = {};
  let unknownHeadersCounter = 0;
  let missingRequiredHeadersCounter = 0;

  try {
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
                  warnings.push(
                    `Unknown column header "${h}" please assign tagret database column`
                  );

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
                  missingRequiredHeadersCounter += 1;
                  const keys = importRequiredHeaders[key].map((k) => {
                    return importHeaders[k].en;
                  });
                  warnings.push(
                    `Required column "${keys.join('" or "')}" not found in CSV.`
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
          logger.info(`importParseInitialCsv() ${error.message}§`);
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
          errors.push(`Invalid row ${trimString(JSON.stringify(row), 120)}`);
        })
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", (rowCount: number) => {
          log.push(`Parsed first ${rowCount} rows`);
          logger.debug(`Parsed first ${rowCount} rows`);
          resolve(true);
        });
    });
  } catch (err: any) {
    errors.push(err.message);
  }

  if (headers.length === 0) errors.push("Headers have not been found");

  if (rows.length === 0) errors.push("No data row(s) found");

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
      errors.push("Headers and rows column count do not match");
    }
  }

  logger.info(`importParseInitialCsv() parsed ${file}`);
  logger.info(
    `importParseInitialCsv() Headers:${headers.length} Errors:${errors.length} MissingHeaders:${missingRequiredHeadersCounter} UnknownHeaders:${unknownHeadersCounter} Rows:${rows.length}`
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

export const importDelete = async (id: number): Promise<Import> => {
  const importInDb: Import = await daoImportGetById(id);

  if (!importInDb)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Import could not be deleted"
    );

  if (importInDb.status === ImportStatus.PROCESSING)
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Import could not be deleted"
    );

  if (importInDb?.fileId) daoFileSetToDelete(importInDb?.fileId);

  return daoImportDelete(id);
};

export default importParseInitialCsv;
