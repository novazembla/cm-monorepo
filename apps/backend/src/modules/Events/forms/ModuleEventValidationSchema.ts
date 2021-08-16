import { string, object, number } from "yup";

import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleEventValidationSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string()
        .lowercase()
        .matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters")
        .required(),
      [`description_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml({ max: 1000 }).required()
          : string().html({ max: 1000 }),
      [`descriptionLocation_${lang}`]: string().html({max: 500}),
      
        
    }),
    {
      ownerId: number(),
      locationId: number().required(),
      status: number(),
    }
  )
);
