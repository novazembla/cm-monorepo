import { parentPort } from "worker_threads";
import { spawn } from "child_process";

import { getApiConfig } from "../config";

const postMessage = (msg: string) => {
  if (parentPort) parentPort.postMessage(msg);
  // eslint-disable-next-line no-console
  else console.log(msg);
};

const doChores = async () => {
  try {
    const apiConfig = getApiConfig();

    spawn(
      "node",
      [`${apiConfig.packageBaseDir}/dist/scripts/generateSitemaps.js`],
      {
        detached: true,
      }
    );
    postMessage(
      `[WORKER:generateSitemaps]: Triggered sitemap generation script: ${apiConfig.packageBaseDir}/dist/scripts/generateSitemaps.js`
    );
  } catch (Err: any) {
    postMessage(
      `[WORKER:generateSitemaps]: Failed to run worker. ${Err.name} ${Err.message}`
    );
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
