import merge from "deepmerge";
import { isPlainObject } from 'is-plain-object';

import { appConfig } from "./appconfig";

import { AppSettingsFieldDefinitions } from "./settings";
import { activeLanguages, defaultLanguage } from "./internationalization";

export type AppConfig = {
  apiUrl?: string | undefined;
  apiDomain?: string | undefined;
  scope?: string | undefined;
  enableRegistration?: boolean;
  settings?: AppSettingsFieldDefinitions;
  defaultPageSize?: number;
  activeLanguages: string[];
  defaultLanguage?: string;
};

// initial state
const configDefault: AppConfig = {
  apiUrl: `${process.env.REACT_APP_API_GRAPHQL_URL}`,
  apiDomain: `${process.env.REACT_APP_API_DOMAIN}`,
  scope: "backend",
  enableRegistration: true,
  defaultPageSize: 50,
  activeLanguages: activeLanguages,
  defaultLanguage: defaultLanguage,
};

export let config: AppConfig = {
  activeLanguages: []
};

try {
  config = merge(configDefault, appConfig, {
    isMergeableObject: isPlainObject
  });
} catch (Err) {
  // eslint-disable-next-line no-console
  console.error(
    "Please make sure to hava a culturemap.js file in the config folder"
  );
}

export const getAppConfig = (): AppConfig => config;

export default config;