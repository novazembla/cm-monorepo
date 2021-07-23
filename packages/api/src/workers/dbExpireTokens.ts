import { parentPort } from "worker_threads";

import { daoTokenDeleteExpired } from "../dao/token";
import { logger } from "../services/serviceLogging";

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

(async () => {
  try {
    const count = await daoTokenDeleteExpired();

    logger.debug(`[WORKER:Db]: Deleted ${count} expired token`);
  } catch (Err) {
    logger.warn(
      `[WORKER:Db]: Failed to run worker. ${Err.name} ${Err.message}`
    );
  }

  // signal to parent that the job is done
  if (parentPort) parentPort.postMessage("done");
  else process.exit(0);
})();
