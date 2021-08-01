import Graceful from "@ladjs/graceful";
import Bree from "bree";
import { join } from "path";

import { server } from "./server";
import { app, addTerminatingErrorHandlingToApp } from "./app";
import config from "./config";
import { logger } from "./services/serviceLogging";
import { getPrismaClient } from "./db/client";

export const startApi = async () => {
  if (server && app) {
    try {
      const prisma = getPrismaClient();

      // now start the appolo server
      await server.start();

      // and attach it to the express app
      server.applyMiddleware({
        app,
        cors: config.corsOptions as any,
      });

      // make sure that any unprocessed errors are displayed in a nice and (data) safe way
      addTerminatingErrorHandlingToApp();

      // finally listen to the configured port
      const expressServer = app.listen({ port: process.env.API_PORT }, () => {
        // eslint-disable-next-line no-console
        console.log(
          `🚀 Server ready at http://localhost:${process.env.API_PORT}${server?.graphqlPath}`
        );
      });

      const bree = new Bree({
        logger,
        root: join(config.packageBaseDir, "dist", "workers"),
        jobs: [
          {
            name: "dbExpireTokens",
            interval: "1m",
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