import httpStatus from "http-status";

import { daoSettingUpsert, SettingUpdateData } from "../dao/setting";

import { ApiError } from "../utils";
import { logger } from "./serviceLogging";

export const settingUpsertSettings = async (
  data: SettingUpdateData[]
): Promise<boolean> => {
  try {
    Promise.all(
      data.map((setting) =>
        daoSettingUpsert(setting.key, { value: setting.value })
      )
    ).catch((err) => {
      throw Error(err.message);
    });

    return true;
  } catch (err) {
    logger.info(err);
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      `Settings could not be saved (${err.message})`
    );
  }
};

export default {
  settingUpsertSettings,
};
