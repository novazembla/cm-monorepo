import { PublishStatus } from "@culturemap/core";

import { logger } from "../services/serviceLogging";
import { getPrismaClient } from "../db/client";

const prisma = getPrismaClient();

export async function cronDbClearItems() {
  logger.info("[CRON:dbClearItems]: starting cron job");
  try {
    const countEventsTrashed = await prisma.event.updateMany({
      data: {
        status: PublishStatus.TRASHED,
      },
      where: {
        isImported: false,
        status: {
          not: PublishStatus.TRASHED,
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
              lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
            },
          },
          {
            lastEventDate: {
              lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
            },
          },
        ],
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Purged ${countEventsCleared.count} events that have been trashed 90 days ago`
    );

    const countPagesCleared = await prisma.page.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
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
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
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
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7),
        },
      },
    });

    logger.info(
      `[CRON:dbClearItems]: Purged ${countToursCleared.count} tours that have been trashed 90 days ago`
    );

    const setting = await prisma.setting.findFirst({
      where: {
        scope: "homepage",
        key: "highlights",
      },
    });

    if (setting && Array.isArray((setting as any)?.value?.json)) {
      const stillActiveHiglights = (
        await Promise.all(
          (setting as any)?.value?.json.map(async (highlight: any) => {
            let flag = true;

            if (highlight.type === "event") {
              const event = await prisma.event.findUnique({
                where: { id: highlight.id },
              });

              if (
                event &&
                event.lastEventDate &&
                event.lastEventDate <= new Date()
              ) {
                flag = false;
              }
            }

            return flag ? highlight : null; // Return highlight or null
          })
        )
      ).filter(Boolean);

      if (
        stillActiveHiglights.length !== (setting as any)?.value?.json.length
      ) {
        logger.info(
          `[CRON:dbClearItems]: Purged ${
            (setting as any)?.value?.json.length - stillActiveHiglights.length
          } highlight(s) from homepage settings`
        );
        await prisma.setting.update({
          data: {
            value: stillActiveHiglights,
          },
          where: {
            id: setting.id,
          },
        });
      }
    }
    logger.info("[CRON:dbClearItems]: ran cron job");
  } catch (Err: any) {
    logger.error(
      `[CRON:dbClearItems]: Failed to run cron job. ${Err.name} ${Err.message}`
    );
  }
}
