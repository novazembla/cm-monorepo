import { string, object, array, boolean, mixed } from "yup";

import { activeLanguages } from "~/config";

export const ModuleTaxonomySchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`name_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string().lowercase().matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters").required(),
    }),
    {
      hasColor: boolean(),
      // t("validation.array.minOneItem", "Please select at least one item")
      modules: array().test(
        'at-least-one',
        'validation.array.minOneItem',
        (value) => !!(value && value.filter((val) => !!val).length > 0),
      ).required()
    }
  )
);

export const ModuleTermSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`name_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string().lowercase().matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters").required(),
    }),
    {
      hasColor: boolean(),
      color: mixed().when("hasColor", {
        is: true,
        // t("validation.slug.notahexcolor", "Please provide a valid HEX color (like #a8f or #f9ad9f")
        then: string().matches(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, "validation.slug.notahexcolor")
          .required(),
        otherwise: string().nullable()
      }),
      colorDark: mixed().when("hasColor", {
        is: true,
        then: string().matches(/^#([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$/, "validation.slug.notahexcolor"),
        otherwise: string().nullable()
      }),
    }
  )
);

