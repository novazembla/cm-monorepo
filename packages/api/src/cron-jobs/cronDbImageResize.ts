import { spawn } from "child_process";

import { logger } from "../services/serviceLogging";
import { getApiConfig } from "../config";

export async function cronDbImageResize() {
  logger.info("[CRON:cronDbImageResize]: starting cron job");
  try {
    const apiConfig = getApiConfig();

    spawn(
      "node",
      [`${apiConfig.packageBaseDir}/dist/scripts/dbConvertImages.js`],
      {
        detached: true,
      }
    );
    logger.info(
      `[CRON:cronDbImageResize]: Triggered image resize script: ${apiConfig.packageBaseDir}/dist/scripts/dbConvertImages.js`
    );
    logger.info("[CRON:cronDbImageResize]: ran cron job");
  } catch (Err: any) {
    logger.error(
      `[CRON:cronDbImageResize]: Failed to run cron job. ${Err.name} ${Err.message}`
    );
  }
}
