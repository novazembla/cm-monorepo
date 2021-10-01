import { string, object, array, boolean, mixed } from "yup";

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
          ? string().nonEmptyHtml().required()
          : string(),
      [`description_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml().required()
          : string(),
      [`duration_${lang}`]: string().required(),
      [`distance_${lang}`]: string().required(),
    }),
    {
      // duration: string().required(),
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

export const ModuleTourStopSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string()
        .lowercase()
        .matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters")
        .required(),
    }),
    {
      hasColor: boolean(),
      color: mixed().when("hasColor", {
        is: true,
        // t("validation.slug.notahexcolor", "Please provide a valid HEX color (like #a8f or #f9ad9f")
        then: string()
          .matches(
            /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
            "validation.slug.notahexcolor"
          )
          .required(),
        otherwise: string().nullable(),
      }),
      colorDark: mixed().when("hasColor", {
        is: true,
        then: string().matches(
          /^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/,
          "validation.slug.notahexcolor"
        ),
        otherwise: string().nullable(),
      }),
    }
  )
);
