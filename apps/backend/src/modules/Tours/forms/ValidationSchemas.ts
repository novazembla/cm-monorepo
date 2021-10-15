import { string, object, mixed, number } from "yup";

import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleTourSchemaCreate = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string()
        .lowercase()
        .matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters")
        .required(),
      [`teaser_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml({ max: 200 }).required()
          : string().html({ max: 200 }),

      [`description_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml().required()
          : string(),
      [`duration_${lang}`]: string().required(),
      [`distance_${lang}`]: string().required(),
    }),
    {
      orderNumber: number().required(),
      // distance: string().required(),
    }
  )
);

export const ModuleTourSchemaUpdate = ModuleTourSchemaCreate.concat(
  object().shape(
    activeLanguages.reduce(
      (acc: any, lang: any) => ({
        ...acc,
        [`heroImage_alt_${lang}`]:
          lang === defaultLanguage
            ? mixed().when("heroImage", {
                is: (value: any) => value && !isNaN(value) && value > 0,
                then: string().required(),
                otherwise: string(),
              })
            : string(),
        [`heroImage_credits_${lang}`]:
          lang === defaultLanguage
            ? mixed().when("heroImage", {
                is: (value: any) => value && !isNaN(value) && value > 0,
                then: string().required(),
                otherwise: string(),
              })
            : string(),
      }),
      {}
    )
  )
);

export const ModuleTourStopCreateSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      [`teaser_${lang}`]:
      lang === defaultLanguage
        ? string().nonEmptyHtml({ max: 200 }).required()
        : string().html({ max: 200 }),
      [`description_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml().required()
          : string(),
    }),
    {
      // t("validation.slug.chooselocation", "Please choose a location")
      locationId: number()
        .typeError("validation.slug.chooselocation")
        .required(),
      path: string(),
    }
  )
);

export const ModuleTourStopUpdateSchema = ModuleTourStopCreateSchema.concat(
  object().shape(
    activeLanguages.reduce(
      (acc: any, lang: any) => ({
        ...acc,
        [`heroImage_alt_${lang}`]:
          lang === defaultLanguage
            ? mixed().when("heroImage", {
                is: (value: any) => value && !isNaN(value) && value > 0,
                then: string().required(),
                otherwise: string(),
              })
            : string(),
        [`heroImage_credits_${lang}`]:
          lang === defaultLanguage
            ? mixed().when("heroImage", {
                is: (value: any) => value && !isNaN(value) && value > 0,
                then: string().required(),
                otherwise: string(),
              })
            : string(),
      }),
      {}
    )
  )
);
