import merge from "deepmerge";
import { isPlainObject } from "is-plain-object";

import { appConfig } from "./tmpappconfig";

import { AppSettingsFieldDefinitions } from "./settings";
import { activeLanguages, defaultLanguage } from "./internationalization";
import type { Complete, GeoLocation } from "~/types";

export type AppConfigSettings = {
  appName?: string | undefined;
  apiUrl?: string | undefined;
  frontendUrl?: string | undefined;
  frontendPreviewSecret?: string | undefined;
  apiGraphQLUrl?: string | undefined;
  scope?: string | undefined;
  enableOpenRegistration?: boolean;
  enableProfilePicture?: boolean;
  settings?: AppSettingsFieldDefinitions;
  defaultCity?: string | undefined;
  defaultPageSize?: number;
  activeLanguages: string[];
  defaultLanguage?: string;
  mapOuterBounds?: [GeoLocation, GeoLocation];
  mapStyleUrl?: string;
};

export type AppConfig = Complete<AppConfigSettings>;
// initial state

const configDefault: AppConfig = {
  appName: "CultureMap",
  apiUrl: `${import.meta.env.VITE_API_URL}`,
  frontendPreviewSecret: `${import.meta.env.VITE_PREVIEW_SECRET}`,
  frontendUrl: `${import.meta.env.VITE_FRONTEND_URL}`,
  apiGraphQLUrl: `${import.meta.env.VITE_API_URL}/graphql`,
  scope: "backend",
  enableOpenRegistration: true,
  enableProfilePicture: true,
  defaultPageSize: 50,
  activeLanguages,
  defaultLanguage,
  defaultCity: "",
  settings: {},
  // mapOuteBouds [ East/South, North/West ] corners
  mapOuterBounds: [
    {
      lat: 52.291884,
      lng: 13.00036,
    },
    {
      lat: 52.712187,
      lng: 13.813182,
    },
  ],
  mapStyleUrl: `${import.meta.env.VITE_MAP_JSON}`
,
};

export let config: AppConfig;

try {
  config = merge(configDefault, appConfig, {
    isMergeableObject: isPlainObject,
  });
} catch (Err) {
  // eslint-disable-next-line no-console
  console.error(
    "Please make sure to hava a culturemap.js file in the config folder"
  );
}

export const getAppConfig = (): AppConfig => config;

export default config;
