import i18n from "i18next";
import * as config from "~/config";

const isObject = (objValue: any) => {
  return (
    objValue && typeof objValue === "object" && objValue.constructor === Object
  );
};

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

export const getMultilangSortedList = (arr: any[], accessor: string): any[] => {
  if (!Array.isArray(arr) || arr.length === 0) return arr;

  if (!isObject(arr[0]) || !(accessor in arr[0])) {
    console.error(
      `getMultilangSortedList() Accessor ${accessor} not found in object`
    );
    return arr;
  }

  return [...arr].sort((a, b) => {
    const valueA = getMultilangValue(a[accessor]).toLowerCase();
    const valueB = getMultilangValue(b[accessor]).toLowerCase();

    if (valueA < valueB) return -1;
    if (valueA > valueB) return 1;

    return 0;
  });
};
