import { string, object, number, mixed, boolean } from "yup";

import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleEventCreateSchema = object().shape(
    {
      "title_de": string().required(),
      "slug_de": string().required(),
      "description_de": string().nonEmptyHtml().required(),
      ownerId: number(),
      isImported: boolean(),
      // t("validation.slug.chooselocation", "Please choose a location")
      locationId: mixed(),
      status: number(),
      isFree: boolean(),
      address: string(),
      organiser: string(),
    }
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

export const ModuleDataExportCreateSchema = object().shape({
  title: string().required(),
});

export const ModuleImportCreateSchema = object().shape({
  title: string().required(),
});

export const ModuleImportUpdateSchema = ModuleImportCreateSchema.concat(
  object().shape({
    status: number().required(),
  })
);
