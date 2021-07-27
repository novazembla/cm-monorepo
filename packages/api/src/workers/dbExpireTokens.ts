import { parentPort } from "worker_threads";
import { prismaDisconnect } from "../db";
import { daoTokenDeleteExpired } from "../dao/token";
import { logger } from "../services/serviceLogging";

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
    const count = await daoTokenDeleteExpired();
    logger.debug(`[WORKER:DbExpireTokens]: Deleted ${count} expired token`);
    await prismaDisconnect();
  } catch (Err) {
    logger.warn(
      `[WORKER:DbExpireTokens]: Failed to run worker. ${Err.name} ${Err.message}`
    );
  }
};

(async () => {
  await doChores();

  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
