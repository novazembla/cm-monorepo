import httpStatus from "http-status";

import {
  daoSettingUpsert,
  SettingUpdateData,
  daoSettingQuery,
} from "../dao/setting";

import { ApiError, parseSettings } from "../utils";
import { logger } from "./serviceLogging";

export const settingUpsertSettings = async (
  data: SettingUpdateData[]
): Promise<boolean> => {
  try {
    await Promise.all(
      data.map((setting) =>
        daoSettingUpsert(
          setting.key,
          {
            value: { json: setting.value },
            key: setting.key,
            scope: setting.scope,
          },
          { value: { json: setting.value } }
        )
      )
    ).catch((err) => {
      throw Error(err.message);
    });

    return true;
  } catch (err) {
    logger.info(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Settings could not be saved`
    );
  }
};

export const getSettings = async (scope: string) => {
  const settingsInDb = await daoSettingQuery({
    scope,
  });
  return parseSettings(settingsInDb);
};

const defaults = {
  getSettings,
  settingUpsertSettings,
};

export default defaults;
