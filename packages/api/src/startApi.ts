import Graceful from "@ladjs/graceful";
// import Bree from "bree";
// import { join } from "path";
import { CronJob } from 'cron';

// !!!! Attention main thread also has to import "sharp" to ensure that the C libraries are always available in worker threads
import "sharp";

import { server } from "./server";
import { app, addTerminatingErrorHandlingToApp } from "./app";
import { getApiConfig } from "./config";
import { logger } from "./services/serviceLogging";
import { getPrismaClient } from "./db/client";
import { cronDbClearItems, cronDbHouseKeeping, cronGenerateSitemaps, cronImportCalendar } from "./cron-jobs";

export const startApi = async () => {
  const apiConfig = getApiConfig();
  if (server && app) {
    try {
      const prisma = getPrismaClient();

      // now start the appolo server
      await server.start();

      // and attach it to the express app
      server.applyMiddleware({
        app,
        cors: apiConfig.corsOptions as any,
      });

      // make sure that any unprocessed errors are displayed in a nice and (data) safe way
      addTerminatingErrorHandlingToApp();

      const port =
        process.env.API_PORT ?? process.env.DEV_API_PORT ?? process.env.PORT;

      const host =
        process.env.DEV_HOST ?? process.env.DEV_DEV_HOST ?? "127.0.0.1";

      // eslint-disable-next-line no-console
      console.log(`🔨 Attempting to run app.listen on ${host}:${port}`);

      // finally listen to the configured port
      const expressServer = app.listen({ port, host }, () => {
        // eslint-disable-next-line no-console
        console.log(
          `🚀 Server ready at ${apiConfig.baseUrl.api}${server?.graphqlPath}`
        );
      });
      
      // // Bree can be debugged with NODE_DEBUG=bree node ./app/...
      // const bree = new Bree({
      //   logger,
      //   root: join(apiConfig.packageBaseDir, "dist", "workers"),
      //   jobs: [
      //     {
      //       name: "dbConvertImages",
      //       interval: process.env.NODE_ENV === "production" ? "37s" : "76s",
      //     }
      //     // ,
      //     // {
      //     //   name: "dbHouseKeeping",
      //     //   interval: process.env.NODE_ENV === "production" ? "1m" : "2m",
      //     // },     
      //   ],
      // });
      // await bree.start();

      const cronJobGenerateSitemaps = new CronJob(
        '15 6,10,14,18,22 * * *', // cronTime
        cronGenerateSitemaps, // onTick
        null, // onComplete
        true, // start
      );

      const cronJobDbHouseKeeping = new CronJob(
        process.env.NODE_ENV === "production" ? '1 * * * *' : '2 * * * *', // cronTime
        cronDbHouseKeeping, // onTick
        null, // onComplete
        true, // start
      );

      const cronJobImportCalendar = new CronJob(
        '0 6 * * *', // cronTime
        cronImportCalendar, // onTick
        null, // onComplete
        true, // start
      );

      const cronJobDbClearItems = new CronJob(
        '* 4 * * * *', // cronTime
        cronDbClearItems, // onTick
        null, // onComplete
        true, // start
      );

      const graceful = new Graceful({
        logger,
        customHandlers: [
          () => {
            cronJobDbClearItems.stop();
            cronJobDbHouseKeeping.stop();
            cronJobGenerateSitemaps.stop();
            cronJobImportCalendar.stop();
            logger.info("Stopped cron jobs");
          },
          () => {
            if (bree) {
              bree.stop();
              logger.info("Stopped Bree");
            }
          },
          () => {
            if (expressServer) {
              expressServer.close();
              logger.info("Stopped Express Server");
            }
          },
          () => {
            if (server) {
              server.stop();
              logger.info("Stopped Apollo Server");
            }
          },
          () => {
            if (prisma) {
              prisma.$disconnect();
              logger.info("Disconnected prisma client");
            }
          },
        ],
      });
      graceful.listen();
    } catch (err) {
      logger.error(err);
    }
  }
};

export default startApi;
