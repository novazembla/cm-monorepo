import { spawn } from "child_process";

import { logger } from "../services/serviceLogging";
import { getApiConfig } from "../config";

export async function cronGenerateSitemaps() {
  logger.info("[CRON:cronGenerateSitemaps]: starting cron job");
  try {
    const apiConfig = getApiConfig();

    spawn(
      "node",
      [`${apiConfig.packageBaseDir}/dist/scripts/generateSitemaps.js`],
      {
        detached: true,
      }
    );
    logger.info(
      `[CRON:generateSitemaps]: Triggered sitemap generation script: ${apiConfig.packageBaseDir}/dist/scripts/generateSitemaps.js`
    );
    logger.info("[CRON:generateSitemaps]: ran cron job");
  } catch (Err: any) {
    logger.error(
      `[CRON:generateSitemaps]: Failed to run cron job. ${Err.name} ${Err.message}`
    );
  }
}
