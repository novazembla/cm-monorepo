import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources, activeLanguages, defaultLanguage } from './config/internationalization';

const config = {
  resources,
  debug: false,

  lng: defaultLanguage,
  fallbackLng: defaultLanguage,
  whitelist: activeLanguages,

  interpolation: {
    escapeValue: false, // not needed for react as it escapes by default
  },
}

const init = async () => 
  await i18n
    // connect with React
    .use(initReactI18next)
    // for all options read: https://www.i18next.com/overview/configuration-options
    .init(config);

init();
export default i18n;