export type FilterableObject<K extends keyof any, T> = {
  [P in K]?: T;
};

export const filteredOutputByBlacklist = (
  obj: object | object[],
  keys?: string[] | undefined
): any => {
  if (!keys) {
    // TODO: better error logging
    return obj;
  }

  if (obj !== Object(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => filteredOutputByBlacklist(item, keys));
  }

  return Object.keys(obj)
    .filter((key) => !keys.includes(key))
    .reduce((acc, key) => {
      return {
        ...acc,
        [key]: filteredOutputByBlacklist((obj as any)[key], keys),
      };
    }, {});
};

export const filteredOutputByWhitelist = (
  obj: object | object[],
  keys?: string[] | undefined
): any => {
  if (!keys) {
    // TODO: better error logging
    return obj;
  }

  if (obj !== Object(obj)) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => filteredOutputByWhitelist(item, keys));
  }

  return Object.keys(obj)
    .filter((key) => keys.includes(key))
    .reduce((acc, key) => {
      return {
        ...acc,
        [key]: filteredOutputByWhitelist((obj as any)[key], keys),
      };
    }, {});
};

export default {
  filteredOutputByBlacklist,
  filteredOutputByWhitelist,
};
