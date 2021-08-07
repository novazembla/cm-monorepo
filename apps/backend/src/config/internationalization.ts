import tranlationEn from "~/locales/en/translation.json";
import tranlationDe from "~/locales/de/translation.json";

// TODO: this should be configurable via the appconfig.ts

export const defaultLanguage = process.env.REACT_APP_DEFAULT_LANGUAGE ?? "en";
export const activeLanguages = ["en", "de"]; // these are the active lanugages in the system

export const resources = {
  en: {
    translation: tranlationEn,
  },
  de: {
    translation: tranlationDe,
  },
};
const config = {
  defaultLanguage,
  activeLanguages,
  resources,
};
export default config;
