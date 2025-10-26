import { filteredOutputByBlacklist } from "@culturemap/core";
import i18n from "i18next";

export const multiLangJsonToRHFormData = (
  data: any,
  multiLangFields: string[],
  activeLanguages: string[]
) => {
  let changedData = multiLangFields.reduce((acc, fieldName) => {
    acc = {
      ...acc,
      ...activeLanguages.reduce((accLang, lang) => {
        if (!data[fieldName] || !data[fieldName][lang]) return accLang;

        accLang = {
          ...accLang,
          [`${fieldName}_${lang}`]: data[fieldName][lang],
        };

        return accLang;
      }, {}),
    };

    return acc;
  }, {});

  changedData = {
    ...data,
    ...changedData,
  };

  return filteredOutputByBlacklist(changedData, multiLangFields);
};

export const multiLangRHFormDataToJson = (
  data: any,
  multiLangFields: string[],
  activeLanguages: string[]
) => {
  let changedData = multiLangFields.reduce((acc, fieldName) => {
    acc = {
      ...acc,
      [fieldName]: activeLanguages.reduce((accLang, lang) => {
        if (!data[`${fieldName}_${lang}`]) return accLang;

        accLang = {
          ...accLang,
          [lang]: data[`${fieldName}_${lang}`],
        };

        return accLang;
      }, {}),
    };

    return acc;
  }, {});

  changedData = {
    ...data,
    ...changedData,
  };

  const filterNamesAndLang = multiLangFields.reduce(
    (acc: string[], fieldName) => {
      return [...acc, ...activeLanguages.map((lang) => `${fieldName}_${lang}`)];
    },
    []
  );

  return filteredOutputByBlacklist(changedData, filterNamesAndLang);
};

export const multiLangImageMetaRHFormDataToJson = (
  data: any,
  fieldName: string,
  imageMultiLangFields: string[],
  activeLanguages: string[]
) => {
  return imageMultiLangFields.reduce((accFields, key) => {
    return {
      ...activeLanguages.reduce((accLangs, lang) => {
        return {
          ...accLangs,
          [`${key}_${lang}`]: data[`${fieldName}_${key}_${lang}`] ?? "",
        };
      }, accFields),
    };
  }, {});
};

export const multiLangImageMetaRHFormFieldsDataToJson = (
  fieldData: any,
  imageMultiLangFields: string[],
  activeLanguages: string[]
) => {
  return imageMultiLangFields.reduce((accFields, key) => {
    return {
      ...activeLanguages.reduce((accLangs, lang) => {
        return {
          ...accLangs,
          [`${key}_${lang}`]: fieldData[`${key}_${lang}`] ?? "",
        };
      }, accFields),
    };
  }, {});
};

export const multiLangTranslationsJsonRHFormData = (
  data: any,
  imageMultiLangFields: string[],
  activeLanguages: string[],
  prefix?: string
) => {
  if (!data) return {};

  return imageMultiLangFields.reduce((accFields, fieldName) => {
    return {
      ...accFields,
      ...activeLanguages.reduce((accLangs, lang) => {
        if (!data[fieldName] || !(lang in data[fieldName])) return accLangs;

        const key = `${prefix ? `${prefix}_` : ""}${fieldName}_${lang}`;

        return {
          ...accLangs,
          [key]: data[fieldName][lang],
        };
      }, accFields),
    };
  }, {});
};

export const multiLangSlugUniqueError = (
  errors: any,
  // eslint-disable-next-line @typescript-eslint/ban-types
  setError: Function
): boolean => {
  if (Array.isArray(errors) && errors.length) {
    if (
      errors[0].message &&
      errors[0].message.indexOf("Slug is not unique") > -1
    ) {
      const regex = /\[(.*?)\]/;
      const result = errors[0].message.match(regex);
      if (result && result.length >= 2) {
        result[1].split(",").forEach((lang: string) => {
          setError(`slug_${lang}`, {
            type: "manual",
            message: i18n.t(
              "validation.notunique",
              "This valaue is not unique"
            ),
          });
        });
      }
      return true;
    }
  }

  return false;
};
