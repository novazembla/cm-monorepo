import tranlationEn from "~/locales/en/translation.json";
import tranlationDe from "~/locales/de/translation.json";

// TODO: this should be configurable via the appconfig.ts

export const defaultLanguage = import.meta.env.VITE_DEFAULT_LANGUAGE ?? "de";
export const activeLanguages = ["de","en"]; // these are the active lanugages in the system, order defined the display of elements

export const resources = {
  de: {
    translation: tranlationDe,
  },
  en: {
    translation: tranlationEn,
  },
};
const config = {
  defaultLanguage,
  activeLanguages,
  resources,
};
export default config;
