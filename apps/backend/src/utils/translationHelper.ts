import i18n from "i18next";
import * as config from "~/config";

export const getMultilangValue = (
  json: Record<string, string> | string
): string => {
  if (!json) return "";

  if (typeof json === "string") return json;

  const defVal = json[config.defaultLanguage ?? ""]
    ? `${json[config.defaultLanguage ?? ""]}`
    : undefined;

  let value =
    json[i18n.language] ??
    defVal ??
    i18n.t("translationnotfound", "Trans. not found");

  return value;
};
