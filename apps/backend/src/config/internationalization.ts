import tranlationEn from "../locales/en/translation.json";
import tranlationDe from "../locales/de/translation.json";

export const defaultLanguage = process.env.REACT_APP_DEFAULT_LANGUAGE ?? "en";
export const whitelist = ["en", "de"]; // these are the active lanugages in the system

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
  whitelist,
  resources,
};
export default config;
