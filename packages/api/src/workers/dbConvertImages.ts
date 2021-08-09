import { parentPort } from "worker_threads";
import { getPrismaClient, prismaDisconnect } from "../db/client";

import { logger } from "../services/serviceLogging";

const prisma = getPrismaClient();

// ALWAY REMEMBER TO CLOSE YOU DB CONNECTION !!!

// https://github.com/breejs/bree#long-running-jobs
// Or use https://threads.js.org/usage for a queing experience .. .
// if (parentPort)
//   parentPort.once("message", (message) => {
//     //
//     // TODO: once we can manipulate concurrency option to p-map
//     // we could make it `Number.MAX_VALUE` here to speed cancellation up
//     // <https://github.com/sindresorhus/p-map/issues/28>
//     //
//     if (message === "cancel") isCancelled = true;
//   });

const doChores = async () => {
  try {
    const count = 0;
    const images = await prisma.image.findMany({
      where: {
        status: "uploaded",
      },
      take: 10,
      select: {
        id: true,
        meta: true,
        uuid: true,
      },
    });

    console.log(images);

    logger.debug(`[WORKER:DbConvertImages]: Processed ${count} images`);
    await prismaDisconnect();
  } catch (Err) {
    logger.warn(
      `[WORKER:DbConvertImages]: Failed to run worker. ${Err.name} ${Err.message}`
    );
  }
};

(async () => {
  await doChores();

  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
