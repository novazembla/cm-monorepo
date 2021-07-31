import i18next from "i18next";
import { AppConfig } from "./config";

export const appConfig: AppConfig = {
  scope: "backend", // Used throughout the site and the API to identify a client/scope
  enableRegistration: true, // If true new users can register via the website
  settings: {
    latitude: { // will be used as field name in the database, should be unique 
      type: "text", // any HTML input field type
      label: i18next.t("settings.nameofyoursett.label", "Label"),
      required: true,
    },
    
  } // TODO: what else is needed? 
};
export default appConfig;
