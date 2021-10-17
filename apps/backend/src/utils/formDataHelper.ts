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
  },{});
};

export const multiLangImageTranslationsJsonRHFormData = (
  data: any,
  imageFields: string[],
  imageMultiLangFields: string[],
  activeLanguages: string[]
) => {
  if (!data) return {};
  
 
  return imageFields.reduce((acc: any, imgFieldName: any) => {
    // if no data is given we still want to return the fields to ensure that they are also correctly reset.
    if (!(imgFieldName in data) || !data[imgFieldName])
      return {
        ...acc,
        ...imageMultiLangFields.reduce((accFields, fieldName) => {
          return {
            ...acc,
            ...activeLanguages.reduce((accLangs, lang) => {
              const key = `${imgFieldName}_${fieldName}_${lang}`;
              return {
                ...accLangs,
                [key]: "",
              };
            }, accFields),
          };
        }, acc),
      }; 
    
    return {
      ...acc,
      ...imageMultiLangFields.reduce((accFields, fieldName) => {
        if (!data[imgFieldName] || !(fieldName in data[imgFieldName])) return accFields;

        return {
          ...acc,
          ...activeLanguages.reduce((accLangs, lang) => {
            if (!data[imgFieldName][fieldName] || !(lang in data[imgFieldName][fieldName])) return accLangs;

            const key = `${imgFieldName}_${fieldName}_${lang}`;

            return {
              ...accLangs,
              [key]: data[imgFieldName][fieldName][lang],
            };
          }, accFields),
        };
      }, acc),
    };
  }, {} as any);
};

export const multiLangSlugUniqueError = (
  errors: any,
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
