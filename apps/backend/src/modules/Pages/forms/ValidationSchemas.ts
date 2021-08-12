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
}

addMethod(string, "nonEmptyHtml", function(options?: {
  errorMessage?: string;
  charCount?: number;
  wordCount?: number;
}) {
  const { errorMessage } = options ?? {};
  const msg = errorMessage ?? "validation.mixed.required";

  return this.test("nonEmptyHtml", msg, function(value) {
      // const { path, createError } = this;
      // const { charCount, wordCount } = options;
      try {
        const dom = new DOMParser().parseFromString(value ?? "", 'text/html');
        return (dom?.body?.textContent ?? "").length > 0;

      } catch (err) {
        return false;
      }
      
  });});

export const ModulePageSchema = object().shape(
  activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`title_${lang}`]: string().required(),
      // t("validation.slug.invalidcharacters", "You can only use A-Z, -, and numbers")
      [`slug_${lang}`]: string().lowercase().matches(/^[a-z\-\d]+$/, "validation.slug.invalidcharacters").required(),
      [`content_${lang}`]: (lang === defaultLanguage)? string().nonEmptyHtml().required() : string(),
    }),
    {
      ownerId: number(),
      status: number(),
    }
  )
);
