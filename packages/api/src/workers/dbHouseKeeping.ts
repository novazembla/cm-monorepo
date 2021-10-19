import { parentPort } from "worker_threads";
import { unlinkSync } from "fs";
import { spawn } from "child_process";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
import {
  ImageStatus,
  FileStatus,
  DataImportStatus,
  DataExportStatus,
} from "@culturemap/core";

// https://github.com/breejs/bree#long-running-jobs
// Or use https://threads.js.org/usage for a queing experience .. .
// if (parentPort)
//   parentPort.once("message", (message) => {
//     //
//     // we could make it `Number.MAX_VALUE` here to speed cancellation up
//     // <https://github.com/sindresorhus/p-map/issues/28>
//     //
//     if (message === "cancel") isCancelled = true;
//   });

const postMessage = (msg: string) => {
  if (parentPort) parentPort.postMessage(msg);
  // eslint-disable-next-line no-console
  else console.log(msg);
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
    const { count } = await prisma.token.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    postMessage(`[WORKER:dbHousekeeping]: Deleted ${count} expired token`);

    const images = await prisma.image.findMany({
      where: {
        status: ImageStatus.DELETED,
      },
      take: 10,
      select: {
        id: true,
        meta: true,
      },
    });

    if (images && images.length > 0) {
      await Promise.all(
        images.map(async (image) => {
          if (image?.meta) {
            const { meta } = image as any;
            try {
              const uploadPath = `${apiConfig.baseDir}/${apiConfig.publicDir}${meta.uploadFolder}/`;

              if (meta?.availableSizes) {
                Object.keys(meta.availableSizes).forEach((size) => {
                  const fileName = meta.availableSizes[size].url
                    .split("/")
                    .pop();
                  unlinkSync(`${uploadPath}${fileName}`);
                });
              } else if (meta?.originalFilePath) {
                unlinkSync(meta?.originalFilePath);
              }

              await prisma.image.delete({
                where: {
                  id: image.id,
                },
              });
            } catch (err: any) {
              postMessage(
                `[WORKER:dbHousekeeping]: image cleanup error - ${err.message}`
              );
            }
          }
        })
      );
    }

    postMessage(
      `[WORKER:dbHousekeeping]: Removed ${images.length} image(s) and their files`
    );

    const files = await prisma.file.findMany({
      where: {
        status: FileStatus.DELETED,
      },
      take: 10,
      select: {
        id: true,
        meta: true,
      },
    });

    if (files && files.length > 0) {
      await Promise.all(
        files.map(async (file) => {
          if (file?.meta) {
            const meta = file?.meta as any;
            try {
              if (meta?.originalFilePath)
                unlinkSync(`${meta.originalFilePath}`);

              await prisma.file.delete({
                where: {
                  id: file.id,
                },
              });
            } catch (err: any) {
              postMessage(
                `[WORKER:dbHousekeeping]: file cleanup error - ${err.message}`
              );
            }
          }
        })
      );
    }
    postMessage(`[WORKER:dbHousekeeping]: Removed ${files.length} file(s)`);

    const importsToDelete = await prisma.dataImport.findMany({
      where: {
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 60),
        },
      },
      include: {
        file: true,
      },
    });

    if (importsToDelete && importsToDelete.length) {
      const fileIds: number[] = importsToDelete.reduce((acc, imp) => {
        if (imp?.file && imp?.file?.id) {
          acc.push(imp?.file?.id);
        }
        return acc;
      }, [] as number[]);

      if (fileIds.length > 0) {
        await prisma.file.updateMany({
          data: {
            status: FileStatus.DELETED,
          },
          where: {
            id: {
              in: fileIds,
            },
          },
        });
        postMessage(
          `[WORKER:dbHousekeeping]: Set ${fileIds.length} import files to be deleted`
        );
      }

      const importCleanup = await prisma.dataImport.deleteMany({
        where: {
          updatedAt: {
            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 60),
          },
        },
      });

      postMessage(
        `[WORKER:dbHousekeeping]: Deleted ${importCleanup.count} expired import(s)`
      );
    }

    const scheduledDataImport = await prisma.dataImport.findFirst({
      where: {
        status: {
          in: [DataImportStatus.PROCESS],
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    if (scheduledDataImport) {
      try {
        // TODO: adjust to production server configuration
        const buildFolder =
          process.env.NODE_ENV !== "production" ? "dist" : "dist";

        let script;
        if (scheduledDataImport.type === "location")
          script = "processLocationDataImportFile.js";

        if (scheduledDataImport.type === "event")
          script = "processEventDataImportFile.js";

        if (script) {
          spawn(
            "node",
            [
              `${apiConfig.packageBaseDir}/${buildFolder}/scripts/${script}`,
              `--importId=${scheduledDataImport.id}`,
            ],
            {
              detached: true,
            }
          );
        }

        postMessage(
          `[WORKER:dbHousekeeping]: Triggered import script for import: ${scheduledDataImport.id}`
        );
      } catch (err) {
        await prisma.dataImport.update({
          data: {
            status: DataImportStatus.ERROR,
            errors: ["Could not execute import script"],
          },
          where: {
            id: scheduledDataImport.id,
          },
        });
        postMessage(
          `[WORKER:dbHousekeeping]: could not trigger script for import: ${scheduledDataImport.id}`
        );
      }
    }

    const dataExportsToDelete = await prisma.dataExport.findMany({
      where: {
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
        },
      },
      include: {
        file: true,
      },
    });

    if (dataExportsToDelete && dataExportsToDelete.length) {
      const fileIds: number[] = dataExportsToDelete.reduce((acc, imp) => {
        if (imp?.file && imp?.file?.id) {
          acc.push(imp?.file?.id);
        }
        return acc;
      }, [] as number[]);

      if (fileIds.length > 0) {
        await prisma.file.updateMany({
          data: {
            status: FileStatus.DELETED,
          },
          where: {
            id: {
              in: fileIds,
            },
          },
        });
        postMessage(
          `[WORKER:dbHousekeeping]: Scheduled ${fileIds.length} uploaded dataExport files to be deleted`
        );
      }

      const dataExportCleanup = await prisma.dataExport.deleteMany({
        where: {
          updatedAt: {
            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
          },
        },
      });

      postMessage(
        `[WORKER:dbHousekeeping]: Deleted ${dataExportCleanup.count} expired dataExport(s)`
      );
    }

    const scheduledDataExport = await prisma.dataExport.findFirst({
      where: {
        status: {
          in: [DataExportStatus.PROCESS],
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    if (scheduledDataExport) {
      try {
        // TODO: adjust to production server configuration
        const buildFolder =
          process.env.NODE_ENV !== "production" ? "dist" : "dist";

        let script;
        if (scheduledDataExport.type === "location")
          script = "processLocationDataExportFile.js";

        if (scheduledDataExport.type === "event")
          script = "processEventDataExportFile.js";

        if (script) {
          spawn(
            "node",
            [
              `${apiConfig.packageBaseDir}/${buildFolder}/scripts/${script}`,
              `--exportId=${scheduledDataExport.id}`,
            ],
            {
              detached: true,
            }
          );
          postMessage(
            `[WORKER:dbHousekeeping]: Triggered dataExport script for dataExport: ${scheduledDataExport.id}`
          );
        } else {
          postMessage(
            `[WORKER:dbHousekeeping]: Could not find export script for ID: ${scheduledDataExport.id} Type:  ${scheduledDataExport.type}`
          );
        }
      } catch (err) {
        await prisma.dataExport.update({
          data: {
            status: DataExportStatus.ERROR,
            errors: ["Could not execute dataExport script"],
          },
          where: {
            id: scheduledDataExport.id,
          },
        });
        postMessage(
          `[WORKER:dbHousekeeping]: could not trigger script for dataExport: ${scheduledDataExport.id}`
        );
      }
    }
    await prisma.$disconnect();
  } catch (Err: any) {
    postMessage(
      `[WORKER:dbHousekeeping]: Failed to run worker. ${Err.name} ${Err.message}`
    );
  } finally {
    if (prisma) await prisma.$disconnect();
  }
};

doChores()
  .then(async () => {
    if (parentPort) postMessage("done");
    else process.exit(0);
  })
  .catch((Err) => {
    postMessage(JSON.stringify(Err));
    process.exit(1);
  });
