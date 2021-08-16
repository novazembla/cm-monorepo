import merge from "deepmerge";
import { isPlainObject } from 'is-plain-object';

import { appConfig } from "./tmpappconfig";

import { AppSettingsFieldDefinitions } from "./settings";
import { activeLanguages, defaultLanguage } from "./internationalization";
import type { Complete } from "../types";

export type AppConfigSettings = {
  apiUrl?: string | undefined;
  apiGraphQLUrl?: string | undefined;
  apiDomain?: string | undefined;
  scope?: string | undefined;
  enableRegistration?: boolean;
  settings?: AppSettingsFieldDefinitions;
  defaultPageSize?: number;
  activeLanguages: string[];
  defaultLanguage: string;
};

export type AppConfig = Complete<AppConfigSettings>;
// initial state
const configDefault: AppConfig = {
  apiUrl: `${process.env.REACT_APP_API_URL}`,
  apiGraphQLUrl: `${process.env.REACT_APP_API_URL}/graphql`,
  apiDomain: `${process.env.REACT_APP_API_DOMAIN}`,
  scope: "backend",
  enableRegistration: true,
  defaultPageSize: 50,
  activeLanguages: activeLanguages,
  defaultLanguage: defaultLanguage,
  settings: {},
};

export let config: AppConfig;

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