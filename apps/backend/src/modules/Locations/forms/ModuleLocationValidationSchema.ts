import { string, object, number, mixed } from "yup";
import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleLocationCreateSchema = object().shape(
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