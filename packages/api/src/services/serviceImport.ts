import { Import } from "@prisma/client";
import { parse } from "@fast-csv/parse";
import httpStatus from "http-status";
import { access } from "fs/promises";
import { createReadStream } from "fs";
import { importHeaders, importRequiredHeaders } from "@culturemap/core";
import { ApiError } from "../utils";
import { logger } from "./serviceLogging";
import { daoImportGetById, daoFileSetToDelete, daoImportDelete } from "../dao";

const trimString = (str: string, length: number) =>
  str.length > length ? str.substring(0, length - 3) + "..." : str;

export const importParseInitialCsv = async (file: string, numRows: number) => {
  const log: any[] = [];
  const errors: any[] = [];
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
            headers: (hdrs) => {
              const mappedHeaders = hdrs.map((h) => {
                if (h === "###") {
                  headersUnparsed[h] = h;
                  return h;
                }

                const k = Object.keys(importHeaders).find((iHk) => {
                  const t = Object.keys(importHeaders[iHk]).find((lang) => {
                    return (
                      importHeaders[iHk][lang].toLowerCase() ===
                      h?.toLowerCase()
                    );
                  });
                  return !!t;
                });

                if (k) {
                  headersUnparsed[k] = h;
                  return k;
                } else {
                  unknownHeadersCounter += 1;
                  errors.push(`Unknown column header "${h}"`);

                  const uKey = `unkown-${unknownHeadersCounter}`;
                  headersUnparsed[uKey] = h;
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
                  const keys = importRequiredHeaders[key].map(
                    (k) => importHeaders[k].en
                  );
                  errors.push(
                    `Missing required column "${keys.join('" or "')}"`
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
        })
        .on("data-invalid", (row) => {
          errors.push(`Invalid row ${trimString(JSON.stringify(row), 120)}`);
        })
        .on("data", (row) => {
          rows.push(row);
        })
        .on("end", (rowCount: number) => {
          log.push(`Parsed ${rowCount} rows`);
          logger.debug(`Parsed ${rowCount} rows`);
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
        agg.push({
          header: headersUnparsed[col],
          headerKey: col,
          row: rows[0][col],
          match: "",
          isId: "",
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

  if (importInDb?.fileId) daoFileSetToDelete(importInDb?.fileId);

  return daoImportDelete(id);
};

export default importParseInitialCsv;
