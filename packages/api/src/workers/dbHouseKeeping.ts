import { parentPort } from "worker_threads";
import { unlinkSync } from "fs";
import { spawn } from "child_process";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
import {
  ImageStatus,
  FileStatus,
  ImportStatus,
  ExportStatus,
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

    // delete event import logs older than 120 days
    const eventImportEventLogCleanup = await prisma.eventImportLog.deleteMany({
      where: {
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 120),
        },
      },
    });

    postMessage(
      `[WORKER:dbHousekeeping]: Deleted ${eventImportEventLogCleanup.count} expired event import logs`
    );

    const importsToDelete = await prisma.import.findMany({
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
          `[WORKER:dbHousekeeping]: Scheduled ${fileIds.length} uploaded import files to be deleted`
        );
      }

      const importCleanup = await prisma.import.deleteMany({
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

    const scheduledImport = await prisma.import.findFirst({
      where: {
        status: {
          in: [ImportStatus.PROCESS],
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    if (scheduledImport) {
      try {
        // TODO: adjust to production server configuration
        const buildFolder =
          process.env.NODE_ENV !== "production" ? "dist" : "dist";

        spawn(
          "node",
          [
            `${apiConfig.packageBaseDir}/${buildFolder}/scripts/processImportFile.js`,
            `--importId=${scheduledImport.id}`,
          ],
          {
            detached: true,
          }
        );
        postMessage(
          `[WORKER:dbHousekeeping]: Triggered import script for import: ${scheduledImport.id}`
        );
      } catch (err) {
        await prisma.import.update({
          data: {
            status: ImportStatus.ERROR,
            errors: ["Could not execute import script"],
          },
          where: {
            id: scheduledImport.id,
          },
        });
        postMessage(
          `[WORKER:dbHousekeeping]: could not trigger script for import: ${scheduledImport.id}`
        );
      }
    }

    const locationExportsToDelete = await prisma.locationExport.findMany({
      where: {
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
        },
      },
      include: {
        file: true,
      },
    });

    if (locationExportsToDelete && locationExportsToDelete.length) {
      const fileIds: number[] = locationExportsToDelete.reduce((acc, imp) => {
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
          `[WORKER:dbHousekeeping]: Scheduled ${fileIds.length} uploaded locationExport files to be deleted`
        );
      }

      const locationExportCleanup = await prisma.locationExport.deleteMany({
        where: {
          updatedAt: {
            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
          },
        },
      });

      postMessage(
        `[WORKER:dbHousekeeping]: Deleted ${locationExportCleanup.count} expired locationExport(s)`
      );
    }

    const scheduledLocationExport = await prisma.locationExport.findFirst({
      where: {
        status: {
          in: [ExportStatus.PROCESS],
        },
      },
      orderBy: {
        updatedAt: "asc",
      },
    });

    if (scheduledLocationExport) {
      try {
        // TODO: adjust to production server configuration
        const buildFolder =
          process.env.NODE_ENV !== "production" ? "dist" : "dist";

        spawn(
          "node",
          [
            `${apiConfig.packageBaseDir}/${buildFolder}/scripts/processLocationExportFile.js`,
            `--exportId=${scheduledLocationExport.id}`,
          ],
          {
            detached: true,
          }
        );
        postMessage(
          `[WORKER:dbHousekeeping]: Triggered locationExport script for locationExport: ${scheduledLocationExport.id}`
        );
      } catch (err) {
        await prisma.locationExport.update({
          data: {
            status: ExportStatus.ERROR,
            errors: ["Could not execute locationExport script"],
          },
          where: {
            id: scheduledLocationExport.id,
          },
        });
        postMessage(
          `[WORKER:dbHousekeeping]: could not trigger script for locationExport: ${scheduledLocationExport.id}`
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
