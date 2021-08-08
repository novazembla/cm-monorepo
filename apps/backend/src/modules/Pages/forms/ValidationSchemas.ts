import { string, object } from "yup";
import { activeLanguages, defaultLanguage } from "~/config";

export const ModulePageSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string().lowercase().matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters").required(),
      [`content_${lang}`]: (lang === defaultLanguage)? string().required() : string(),
    }),
    {}
  )
);
