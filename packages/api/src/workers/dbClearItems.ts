import { parentPort } from "worker_threads";

// !!!! ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!
import Prisma from "@prisma/client";

import { getApiConfig } from "../config";
import { PublishStatus } from "@culturemap/core";

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
        url: `${apiConfig.db.url}${
          apiConfig.db.url.indexOf("?") > -1 ? "&" : "?"
        }connection_limit=1`,
      },
    },
  });

  try {
    const countEventsTrashed = await prisma.event.updateMany({
      data: {
        status: PublishStatus.TRASHED,
      },
      where: {
        isImported: false,
        lastEventDate: {
          lt: new Date(),
        },
      },
    });

    postMessage(
      `[WORKER:dbClearItems]: Set ${countEventsTrashed.count} expired events to trashed`
    );

    const countEventsCleared = await prisma.event.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    postMessage(
      `[WORKER:dbClearItems]: Purged ${countEventsCleared.count} events that have been trashed 90 days ago`
    );

    const countPagesCleared = await prisma.page.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    postMessage(
      `[WORKER:dbClearItems]: Purged ${countPagesCleared.count} pages that have been trashed 90 days ago`
    );

    const countLocationsCleared = await prisma.location.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    postMessage(
      `[WORKER:dbClearItems]: Purged ${countLocationsCleared.count} locations that have been trashed 90 days ago`
    );

    await prisma.$disconnect();

    const countToursCleared = await prisma.tour.deleteMany({
      where: {
        status: PublishStatus.TRASHED,
        updatedAt: {
          lt: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 90),
        },
      },
    });

    postMessage(
      `[WORKER:dbClearItems]: Purged ${countToursCleared.count} tours that have been trashed 90 days ago`
    );

    await prisma.$disconnect();
  } catch (Err: any) {
    postMessage(
      `[WORKER:dbClearItems]: Failed to run worker. ${Err.name} ${Err.message}`
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
