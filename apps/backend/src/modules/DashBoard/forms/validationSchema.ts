import { string, object, array } from "yup";
import { activeLanguages, defaultLanguage } from "~/config";

export const ModuleDashboardSchema = object().shape({
  ...activeLanguages.reduce(
    (acc, lang) => ({
      ...acc,
      [`missionStatement_${lang}`]:
        lang === defaultLanguage
          ? string().nonEmptyHtml({ max: 250 }).required()
          : string().html({ max: 250 }),
    }),
    {
      highlights: array().min(1),
    }
  ),
});
