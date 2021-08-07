import { string, object } from "yup";
import { activeLanguages } from "~/config";

export const ModuleTaxonomySchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`name_${lang}`]: string().required(),
      [`slug_${lang}`]: string().required(),
    }),
    {}
  )
);
