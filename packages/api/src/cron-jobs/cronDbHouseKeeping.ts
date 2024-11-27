import { unlinkSync } from "fs";
import { spawn } from "child_process";

import {
  ImageStatus,
  FileStatus,
  DataImportStatus,
  DataExportStatus,
} from "@culturemap/core";

import { getApiConfig } from "../config";
import { logger } from "../services/serviceLogging";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

function sleep(ms:number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function cronDbHouseKeeping() {
  logger.info("[CRON:cronDbHouseKeeping]: starting cron job 1");
  
  await sleep(30000);
  
  logger.info("[CRON:cronDbHouseKeeping]: starting cron job 2");
  
  try {
    const apiConfig = getApiConfig();

    const { count } = await prisma.token.deleteMany({
      where: {
        expires: {
          lt: new Date(),
        },
      },
    });

    logger.info(`[CRON:dbHousekeeping]: Deleted ${count} expired token`);

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
              try {
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
              } catch (err: any) {
                logger.error(
                  `[CRON:dbHousekeeping]: image delete error - ${err.message}`
                );
              }

              await prisma.image.delete({
                where: {
                  id: image.id,
                },
              });
            } catch (err: any) {
              logger.error(
                `[CRON:dbHousekeeping]: image cleanup error - ${err.message}`
              );
            }
          }
        })
      );
    }

    logger.info(
      `[CRON:dbHousekeeping]: Removed ${images.length} image(s) and their files`
    );

    const staleImages = await prisma.image.findMany({
      where: {
        type: "suggestion",
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
        },
      },
      take: 10,
      select: {
        id: true,
        meta: true,
      },
    });

    if (staleImages && staleImages.length > 0) {
      await Promise.all(
        staleImages.map(async (image) => {
          if (image?.meta) {
            const { meta } = image as any;
            try {
              const uploadPath = `${apiConfig.baseDir}/${apiConfig.publicDir}${meta.uploadFolder}/`;

              try {
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
              } catch (err: any) {
                logger.error(
                  `[CRON:dbHousekeeping]: image file delete error - ${err.message}`
                );
              }

              await prisma.image.delete({
                where: {
                  id: image.id,
                },
              });
            } catch (err: any) {
              logger.error(
                `[CRON:dbHousekeeping]: image cleanup error - ${err.message}`
              );
            }
          }
        })
      );
    }

    logger.info(
      `[CRON:dbHousekeeping]: Removed ${images.length} stale suggestion image(s) and their files`
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
              try {
                if (meta?.originalFilePath)
                  unlinkSync(`${meta.originalFilePath}`);
              } catch (err: any) {
                logger.error(
                  `[CRON:dbHousekeeping]: file delete error - ${err.message}`
                );
              }
              await prisma.file.delete({
                where: {
                  id: file.id,
                },
              });
            } catch (err: any) {
              logger.error(
                `[CRON:dbHousekeeping]: file cleanup error - ${err.message}`
              );
            }
          }
        })
      );
    }
    logger.info(`[CRON:dbHousekeeping]: Removed ${files.length} file(s)`);

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
        logger.info(
          `[CRON:dbHousekeeping]: Set ${fileIds.length} import files to be deleted`
        );
      }

      const importCleanup = await prisma.dataImport.deleteMany({
        where: {
          updatedAt: {
            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 60),
          },
        },
      });

      logger.info(
        `[CRON:dbHousekeeping]: Deleted ${importCleanup.count} expired import(s)`
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

        logger.info(
          `[CRON:dbHousekeeping]: Triggered import script for import: ${scheduledDataImport.id}`
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
        logger.error(
          `[CRON:dbHousekeeping]: could not trigger script for import: ${scheduledDataImport.id}`
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
        logger.info(
          `[CRON:dbHousekeeping]: Scheduled ${fileIds.length} uploaded dataExport files to be deleted`
        );
      }

      const dataExportCleanup = await prisma.dataExport.deleteMany({
        where: {
          updatedAt: {
            lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
          },
        },
      });

      logger.info(
        `[CRON:dbHousekeeping]: Deleted ${dataExportCleanup.count} expired dataExport(s)`
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
          logger.info(
            `[CRON:dbHousekeeping]: Triggered dataExport script for dataExport: ${scheduledDataExport.id}`
          );
        } else {
          logger.info(
            `[CRON:dbHousekeeping]: Could not find export script for ID: ${scheduledDataExport.id} Type:  ${scheduledDataExport.type}`
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
        logger.error(
          `[CRON:dbHousekeeping]: could not trigger script for dataExport: ${scheduledDataExport.id}`
        );
      }
    }
    logger.info("[CRON:dbHousekeeping]: ran cron job");
  } catch (Err: any) {
    logger.error(
      `[CRON:dbHousekeeping]: Failed to run cron job. ${Err.name} ${Err.message}`
    );
  }
};
