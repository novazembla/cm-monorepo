import { string, object, number } from "yup";
import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleLocationValidationSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string()
        .lowercase()
        .matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters")
        .required(),

      [`address_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml({ max: 500 }).required()
          : string().html({ max: 500 }),
      [`description_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml({ max: 1000 }).required()
          : string().html({ max: 1000 }),
      [`offers_${lang}`]: string().html({ max: 500 }),
      [`contactInfo_${lang}`]: string().html({ max: 500 }),
    }),
    {
      lat: number().required().latitude(),
      lng: number().longitude().required(),
      ownerId: number(),
      status: number(),
    }
  )
);
