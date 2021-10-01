import { string, object, number, mixed } from "yup";

import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleEventCreateSchema = object().shape(
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
      // t("validation.slug.chooselocation", "Please choose a location")
      locationId: number().typeError("validation.slug.chooselocation").required(),
      status: number(),
    }
  )
);

export const ModuleEventUpdateSchema = ModuleEventCreateSchema.concat(
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