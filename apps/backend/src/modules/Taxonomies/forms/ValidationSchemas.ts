import { string, object, array } from "yup";

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
      // t("vvalidation.array.minOneItem", "Please select at least one item")
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
    {}
  )
);

