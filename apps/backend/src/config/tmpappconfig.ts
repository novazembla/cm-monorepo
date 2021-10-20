// TODO: make the app really configureable
//import i18next from "i18next";
import type { AppConfigSettings } from "./config";
// import {string, object} from "yup";

// this is the full list of the keys that are used for custom settings.
// replace none
export type AppConfigSettingsFiledKeys = "none";

export const appConfig: AppConfigSettings = {
  appName: "CultureMap",
  scope: "backend", // Used throughout the site and the API to identify a client/scope
  enableOpenRegistration: false,
  enableProfilePicture: false,
  defaultPageSize: 30,
  defaultLanguage: "de",
  activeLanguages: ["de", "en"],
  settings: {}, // TODO: what else is needed?
};
export default appConfig;
