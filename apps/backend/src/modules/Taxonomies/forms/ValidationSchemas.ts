import { string, object } from "yup";
import { activeLanguages } from "~/config";

export const ModuleTaxonomySchema = object().shape(
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