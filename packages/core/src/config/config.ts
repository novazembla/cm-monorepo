import { access } from "fs/promises";

import path from "path";
import dotenv from "dotenv";

dotenv.config();
export const { env } = process;

export const culturemap = {
  plugins: [],
  theme: {},
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

    if (cmConfig?.plugins && Array.isArray(cmConfig.plugins)) {
      culturemap.plugins = [...culturemap.plugins, ...cmConfig.plugins];
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }
}

export const config = async () => {
  const configFilePath = path.resolve(process.cwd(), "culturemap.config.js");
  if (await exists(configFilePath)) {
    await getConfigFromFile(configFilePath);
  }
};

export default {
  config,
  culturemap,
  env,
};
