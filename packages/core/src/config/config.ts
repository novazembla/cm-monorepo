import { access } from "fs/promises";

import path from "path";
import dotenv from "dotenv";

import { Plugin, plugins } from "../plugins";
import { updateWindmillUISettings, updateCultureMapSettings } from "../theme";

dotenv.config();
export const { env } = process;

export interface CulturemapSettings {
  plugins: Array<Plugin>;
  theme: {
    windmillUI: object;
    culturemap: object;
  };
}

export const culturemap: CulturemapSettings = {
  plugins: [],
  theme: {
    windmillUI: {},
    culturemap: {},
  },
};

export interface Config {
  culturemap: CulturemapSettings;
  env: NodeJS.ProcessEnv;
  prepare: Function;
}

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

    if (
      cmConfig?.default?.plugins &&
      Array.isArray(cmConfig?.default.plugins)
    ) {
      culturemap.plugins = [
        ...culturemap.plugins,
        ...cmConfig?.default.plugins,
      ];
    }

    if ("theme" in cmConfig?.default) {
      if ("windmillUI" in cmConfig?.default.theme) {
        culturemap.theme.windmillUI = {
          ...culturemap.theme.windmillUI,
          ...cmConfig?.default.theme.windmillUI,
        };
      }
      if ("culturemap" in cmConfig?.default.theme) {
        culturemap.theme.culturemap = {
          ...culturemap.theme.culturemap,
          ...cmConfig?.default.theme.culturemap,
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

  if (Array.isArray(culturemap.plugins)) {
    culturemap.plugins.forEach((plugin) => {
      plugins.register(plugin);
    });
  }

  if ("theme" in culturemap) {
    if ("windmillUI" in culturemap.theme) {
      updateWindmillUISettings(culturemap.theme.windmillUI);
    }
    if ("culturemap" in culturemap.theme) {
      updateCultureMapSettings(culturemap.theme.culturemap);
    }
  }
};

export const config: Config = {
  culturemap,
  env,
  prepare,
};

export default config;
