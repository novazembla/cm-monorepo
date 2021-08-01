import merge from "deepmerge";

import { appConfig } from "./appconfig";

import { AppSettingField } from "./settings";

export type AppConfig = {
  apiUrl?: string | undefined;
  apiDomain?: string | undefined;
  scope?: string | undefined;
  enableRegistration?: boolean;
  settings?: Record<string, AppSettingField>;
};

// initial state
const configDefault: AppConfig = {
  apiUrl: `${process.env.REACT_APP_API_GRAPHQL_URL}`,
  apiDomain: `${process.env.REACT_APP_API_DOMAIN}`,
  scope: "backend",
  enableRegistration: true,
};

export let config: AppConfig = {};

try {
  config = merge(configDefault, appConfig);
} catch (Err) {
  // eslint-disable-next-line no-console
  console.error(
    "Please make sure to hava a culturemap.js file in the config folder"
  );
}

export const getAppConfig = (): AppConfig => config;

export default config;