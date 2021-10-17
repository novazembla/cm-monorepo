import { string, object, number, mixed, array } from "yup";
import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleLocationCreateSchema = object().shape({
  ...activeLanguages.reduce(
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
      [`offers_${lang}`]: string().html({ max: 500 }),
      [`accessibilityInformation_${lang}`]: string().html({ max: 500 }),
    }),
    {
      lat: number().required().latitude(),
      lng: number().longitude().required(),
      co: string(),
      street1: string().required(),
      street2: string(),
      houseNumber: string().required(),
      city: string().required(),
      postCode: string().required(),
      ownerId: number(),
      status: number(),
      phone1: string(),
      phone2: string(),
      email1: string().email(),
      email2: string().email(),
      facebook: string().url(),
      twitter: string().url(),
      instagram: string().url(),
      youtube: string().url(),
      website: string().url(),
      agency: string(),
    }
  ),
  images: array().of(
    object().shape({
      id: number().typeError("validation.image.required").required(),
      ...activeLanguages.reduce(
        (acc, lang) => ({
          ...acc,
          [`alt_${lang}`]:
            lang === defaultLanguage ? string().required() : string(),
          [`credits_${lang}`]:
            lang === defaultLanguage ? string().required() : string(),
        }),
        {}
      ),
    })
  ),
});

export const ModuleLocationExportCreateSchema = object().shape({
  title: string().required(),
});

export const ModuleLocationUpdateSchema = ModuleLocationCreateSchema.concat(
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
      {
        // t("validation.image.required", "Please upload an image")
        // heroImage: mixed().test(
        //   'is-required-image',
        //   'validation.image.required',
        //   (value) => {
        //     return (value && !isNaN(value) && value > 0)
        //   },
        // ),
      } as any
    )
  )
);

export const ModuleImportCreateSchema = object().shape({
  title: string().required(),
});

export const ModuleImportUpdateSchema = ModuleImportCreateSchema.concat(
  object().shape({
    status: number().required(),
  })
);
