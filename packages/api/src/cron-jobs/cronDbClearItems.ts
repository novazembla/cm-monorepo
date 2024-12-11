import { PublishStatus } from "@culturemap/core";

import { logger } from "../services/serviceLogging";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export async function cronDbClearItems () {
  logger.info("[CRON:dbClearItems]: starting cron job");
  try {
    const countEventsTrashed = await prisma.event.updateMany({
      data: {
        status: PublishStatus.TRASHED,
      },
      where: {
        isImported: false,
        status: {
          not: PublishStatus.TRASHED
        },
        lastEventDate: {
          // delete all events that had their last event yesterday
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24),
        },
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Set ${countEventsTrashed.count} expired events to trashed`
    );

    const countEventsCleared = await prisma.event.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        OR: [
          {
            updatedAt: {
              lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
            }
          },
          {
            lastEventDate: {
              lt:new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
            },
          }  
        ]
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Purged ${countEventsCleared.count} events that have been trashed 90 days ago`
    );

    const countPagesCleared = await prisma.page.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Purged ${countPagesCleared.count} pages that have been trashed 90 days ago`
    );

    const countLocationsCleared = await prisma.location.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Purged ${countLocationsCleared.count} locations that have been trashed 90 days ago`
    );

    const countToursCleared = await prisma.tour.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Purged ${countToursCleared.count} tours that have been trashed 90 days ago`
    );
    logger.info("[CRON:dbClearItems]: ran cron job");
  } catch (Err: any) {
    logger.error(
      `[CRON:dbClearItems]: Failed to run cron job. ${Err.name} ${Err.message}`
    );
  }
};
