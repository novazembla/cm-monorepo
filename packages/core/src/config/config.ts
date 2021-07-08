import { access } from "fs/promises";

import path from "path";
import dotenv from "dotenv";

import { Plugins, plugins } from "../plugins";
import { updateWindmillUISettings, updateCultureMapSettings } from "../theme";

dotenv.config();
export const { env } = process;

export interface CulturemapPrivateJSONDataKeys {
  all: Array<string>;
  location: Array<string>;
  event: Array<string>;
  tour: Array<string>;
  user: Array<string>;
}

export interface CulturemapDBSettings {
  defaultPageSize: number;
  privateJSONDataKeys: CulturemapPrivateJSONDataKeys;
}

export interface Config {
  plugins: Plugins;
  theme: {
    windmillUI: object;
    culturemap: object;
  };
  db: CulturemapDBSettings;
  env: NodeJS.ProcessEnv;
  prepare: Function;
}

const theme = {
  windmillUI: {},
  culturemap: {},
};

const db: CulturemapDBSettings = {
  defaultPageSize: 50,
  privateJSONDataKeys: {
    all: ["password"],
    location: ["createdAt", "updatedAt"],
    event: ["createdAt", "updatedAt"],
    tour: ["createdAt", "updatedAt"],
    user: ["password"],
  },
};

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getConfigFromFile(configFilePath) {
  try {
    const cmConfig = await import(configFilePath);

    if (cmConfig?.default?.plugins && Array.isArray(cmConfig.default.plugins)) {
      cmConfig.default.plugins.forEach((plugin) => {
        plugins.register(plugin);
      });
    }

    if ("privateJSONDataKeys" in cmConfig?.default) {
      Object.keys(db.privateJSONDataKeys).forEach((key) => {
        if (key in cmConfig.default.privateJSONDataKeys) {
          db.privateJSONDataKeys[key] = cmConfig.default.privateJSONDataKeys[
            key
          ].reduce((jsonKeys, jsonKey) => {
            if (jsonKeys.indexOf(jsonKey) === -1) jsonKeys.push(jsonKey);

            return jsonKeys;
          }, db.privateJSONDataKeys[key]);
        }
      });
    }

    if ("db" in cmConfig?.default && "defaultPageSize" in cmConfig.default.db) {
      db.defaultPageSize = cmConfig.default.db.defaultPageSize;
    }

    if ("theme" in cmConfig?.default) {
      if ("windmillUI" in cmConfig?.default.theme) {
        theme.windmillUI = {
          ...theme.windmillUI,
          ...cmConfig.default.theme.windmillUI,
        };
      }
      if ("culturemap" in cmConfig?.default.theme) {
        theme.culturemap = {
          ...theme.culturemap,
          ...cmConfig.default.theme.culturemap,
        };
      }
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export const prepare = async () => {
  const configFilePath = path.resolve(process.cwd(), "culturemap.config.js");
  if (await exists(configFilePath)) {
    await getConfigFromFile(configFilePath);
  }

  updateWindmillUISettings(theme.windmillUI);
  updateCultureMapSettings(theme.culturemap);
};

export const config: Config = {
  db,
  theme,
  plugins,
  env,
  prepare,
};

export default config;
