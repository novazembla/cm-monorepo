import { addMethod, string, object, BaseSchema, number } from "yup";
import { AnyObject, Maybe } from "yup/lib/types";

import { activeLanguages, defaultLanguage } from "~/config";

declare module "yup" {
  interface StringSchema<
    TType extends Maybe<string> = string | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
  > extends BaseSchema<TType, TContext, TOut> {
    nonEmptyHtml(): StringSchema<TType, TContext>;
  }

  interface NumberSchema<
    TType extends Maybe<number> = number | undefined,
    TContext extends AnyObject = AnyObject,
    TOut extends TType = TType
  > extends BaseSchema<TType, TContext, TOut> {
    latitude(): NumberSchema<TType, TContext>;
    longitude(): NumberSchema<TType, TContext>;
  }
}

addMethod(
  string,
  "nonEmptyHtml",
  function (options?: {
    errorMessage?: string;
    charCount?: number;
    wordCount?: number;
  }) {
    const { errorMessage } = options ?? {};
    const msg = errorMessage ?? "validation.mixed.required";

    return this.test("nonEmptyHtml", msg, function (value) {
      // const { path, createError } = this;
      // const { charCount, wordCount } = options;
      try {
        const dom = new DOMParser().parseFromString(value ?? "", "text/html");
        console.log(dom.body.textContent);

        return (dom?.body?.textContent ?? "").length > 0;
      } catch (err) {
        return false;
      }
    });
  }
);

// t("validation.number.nolatitude", "Longitudes are numbers between -90.00 and 90.00")
addMethod(number, "latitude", function (options?: { errorMessage?: string }) {
  const { errorMessage } = options ?? {};
  const msg = errorMessage ?? "validation.number.nolatitude";

  return this.test("latitude", msg, function (value) {
    if (value) {
      try {
        return isFinite(value) && Math.abs(value) <= 90;
      } catch (err) {
        return false;
      }
    }

    return false;
  });
});

// t("validation.number.nolongitude", "Longitudes are numbers between -180.00 and 180.00")
addMethod(number, "longitude", function (options?: { errorMessage?: string }) {
  const { errorMessage } = options ?? {};
  const msg = errorMessage ?? "validation.number.nolongitude";

  return this.test("longitude", msg, function (value) {
    if (value) {
      try {
        return isFinite(value) && Math.abs(value) <= 180;
      } catch (err) {
        return false;
      }
    }

    return false;
  });
});

export const ModuleLocationValidationSchema = object().shape(
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
          ? string().nonEmptyHtml().required()
          : string(),
      [`description_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml().required().max(1000)
          : string().max(1000),
    }),
    {
      lat: number().latitude().required(),
      lng: number().longitude().required(),
      ownerId: number(),
      status: number(),
    }
  )
);
