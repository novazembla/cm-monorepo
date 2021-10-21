import { isObject } from "../utils";
import { getApiConfig } from "../config";

export const daoSharedMapJsonToTranslatedColumns = (
  data: any,
  translatedColumns: string[]
) => {
  const config = getApiConfig();

  if (
    !Array.isArray(config?.activeLanguages) ||
    config?.activeLanguages.length === 0
  )
    return data;

  if (data)
    return translatedColumns.reduce((processedData: any, column: any) => {
      return config?.activeLanguages.reduce((j: any, lang: any) => {
        let out = j;
        if (column in processedData) {
          if (isObject(processedData[column]) && processedData[column][lang]) {
            out = {
              ...out,
              [`${column}_${lang}`]: processedData[column][lang],
            };
          }

          delete out[`${column}`];
        }
        return out;
      }, processedData);
    }, data);

  return data;
};

export const daoSharedCheckSlugUnique = async (
  findMany: Function,
  slug: Record<string, string>,
  uniqueInObject: boolean = true,
  id?: number
): Promise<{ ok: boolean; errors: Record<string, boolean> }> => {
  let errors = {};
  let ok = false;

  // first simply compare all slugs in the json
  // they can't be the same for the same id either
  if (uniqueInObject) {
    errors = Object.keys(slug).reduce((acc, key: string) => {
      if (
        Object.keys(slug).find(
          (testkey: string) => testkey !== key && slug[testkey] === slug[key]
        )
      ) {
        return {
          ...acc,
          [key]: "You can't use the same slug in the same object",
        };
      }
      return acc;
    }, errors);

    // seems like the slugs are not unique for the object
    if (Object.keys(errors).length > 0) {
      ok = false;
      return { ok, errors };
    }
  }

  // now test it with other object in the table
  const slugTests = Object.keys(slug).map((key) => ({
    [`slug_${key}`]: slug[key],
  }));

  const terms = await findMany({
    where: {
      OR: slugTests,
      ...(id
        ? {
            NOT: {
              id,
            },
          }
        : {}),
    },
    select: Object.keys(slug).reduce(
      (acc, key) => ({
        ...acc,
        [`slug_${key}`]: true,
      }),
      {}
    ),
  });

  if (terms) {
    // so there are other objects that have the same slug.
    // lets find the offending one slug.

    errors = terms.reduce((errorsAcc: any, item: any) => {
      return {
        ...errorsAcc,
        ...Object.keys(slug).reduce((acc, key: string) => {
          if (item[`slug_${key}`] === slug[key]) {
            return {
              ...acc,
              [key]: "This slug is already in use",
            };
          }
          return acc;
        }, {}),
      };
    }, errors);
    ok = !(Object.keys(errors).length > 0);
  } else {
    ok = true;
  }
  return { ok, errors };
};

export const daoSharedGenerateFullText = (
  data: any,
  keys: string[],
  translatedColumns?: string[]
) => {
  const config = getApiConfig();

  const processElement = (fullText: string, key: string) => {
    if (typeof data[key] !== "object") {
      if (data[key]) {
        return `${fullText} ${data[key]}`;
      } else {
        return fullText;
      }
    }

    return `${fullText} ${Object.keys(data[key])
      .map((oKey) => data[key][oKey])
      .join("\n")}`;
  };

  return keys.reduce((fullText: string, key) => {
    if (translatedColumns && translatedColumns.includes(key)) {
      return config.activeLanguages.reduce((fT: string, lang: any) => {
        if (`${key}_${lang}` in data) {
          return `${fT} ${data[`${key}_${lang}`]}`;
        }
        return fT;
      }, fullText);
    } else {
      if (!(key in data)) return fullText;

      return processElement(fullText, key);
    }
  }, "");
};

export const daoSharedGetTranslatedSelectColumns = (
  columns: string | string[]
) => {
  const config = getApiConfig();

  if (
    !Array.isArray(config?.activeLanguages) ||
    config.activeLanguages.length === 0
  )
    return {};

  return config.activeLanguages.reduce(
    (accLang: any, lang: string) => ({
      ...accLang,
      ...(Array.isArray(columns) ? columns : [columns]).reduce(
        (accColumns: any, column: string) => ({
          ...accColumns,
          [`${column}_${lang}`]: true,
        }),
        {}
      ),
    }),
    {}
  );
};

export const daoSharedMapTranslatedColumnsInRowToJson = (
  p: any,
  column: string,
  process?: (val: any) => any
) => {
  const config = getApiConfig();

  return config.activeLanguages.reduce((j: any, lang: string) => {
    return {
      ...j,
      [lang]:
        (typeof process == "function"
          ? process(p[`${column}_${lang}`])
          : p[`${column}_${lang}`]) ?? null,
    };
  }, {});
};

const defaults = {
  daoSharedGetTranslatedSelectColumns,
  daoSharedGenerateFullText,
  daoSharedCheckSlugUnique,
};
export default defaults;
