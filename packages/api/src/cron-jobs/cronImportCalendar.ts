import { spawn } from "child_process";

import { logger } from "../services/serviceLogging";
import { getApiConfig } from "../config";

export async function cronImportCalendar() {
  logger.info("[CRON:cronImportCalendar]: starting cron job");
  try {
    const apiConfig = getApiConfig();

    spawn(
      "node",
      [`${apiConfig.packageBaseDir}/dist/scripts/import.berlin.de.calendar.js`],
      {
        detached: true,
      }
    );
    logger.info(
      `[CRON:importCalendar]: Triggered calendar import script: ${apiConfig.packageBaseDir}/dist/scripts/import.berlin.de.calendar.js`
    );
    logger.info("[CRON:importCalendar]: ran cron job");
  } catch (Err: any) {
    logger.error(
      `[CRON:importCalendar]: Failed to run cron job. ${Err.name} ${Err.message}`
    );
  }
}
