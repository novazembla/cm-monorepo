import Graceful from "@ladjs/graceful";

// !!!! Attention main thread also has to import "sharp" to ensure that the C libraries are always available in worker threads
import "sharp";

import Bree from "bree";
import { join } from "path";

import { server } from "./server";
import { app, addTerminatingErrorHandlingToApp } from "./app";
import { getApiConfig } from "./config";
import { logger } from "./services/serviceLogging";
import { getPrismaClient } from "./db/client";

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

      const bree = new Bree({
        logger,
        root: join(apiConfig.packageBaseDir, "dist", "workers"),
        jobs: [
          {
            name: "dbHouseKeeping",
            interval: process.env.NODE_ENV === "production" ? "1m" : "2m",
          },
          {
            name: "dbConvertImages",
            interval: process.env.NODE_ENV === "production" ? "37s" : "76s",
          },
          {
            name: "importCalendar",
            cron: "0 6 * * *",
          },
          {
            name: "generateSitemaps",
            cron: "0 6,10,14,18,22 * * *",
          },
          {
            name: "dbClearItems",
            cron: "0 4 * * *",
          },
        ],
      });
      bree.start();

      const graceful = new Graceful({
        logger,
        customHandlers: [
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
