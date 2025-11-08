import logger from "../services/serviceLogging";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";

let log: string[] = [];
let errors: string[] = [];
let warnings: string[] = [];

const doChores = async () => {
  const apiConfig = getApiConfig();

  const { PrismaClient } = Prisma;
  const prisma = new PrismaClient({
    log: ["query", "info", "warn", "error"],
    datasources: {
      db: {
        url: `${apiConfig.db.url}${
          apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
        }connection_limit=1`,
      },
    },
  });

  try {
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
                logger.info(
                  `Event ${event.title_en} expired, removing from highlights`
                );
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
          `Removing ${
            (setting as any)?.value?.json.length - stillActiveHiglights.length
          } highlight(s)`
        );
        await prisma.setting.update({
          data: {
            value: {
              json: stillActiveHiglights,
            },
          },
          where: {
            id: setting.id,
          },
        });
      }
    }
  } catch (err: any) {
    logger.error(`settings highlights clear: ${err.name} ${err.message}`);
    errors.push(`settings highlights clear: ${err.name} ${err.message}`);
    logger.debug(JSON.stringify(err));
  } finally {
    if (prisma) {
      await prisma.$disconnect();
      console.log("Prisma client disconnected");
    }
  }
};

doChores()
  .then(async () => {
    logger.info(
      `settings highlights clear: errors: ${errors.length}, warnings: ${warnings.length}, log: ${log.length}`
    );
    logger.info("settings highlights clear: done");
    process.exit(0);
  })
  .catch((err: any) => {
    logger.error(`settings highlights clear: ${err.name} ${err.message}`);
    logger.debug(JSON.stringify(err));
    process.exit(1);
  });
