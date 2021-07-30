import httpStatus from "http-status";
import { ApiError } from "./ApiError";

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

export const filteredOutputOrNotFound = (
  obj: object | object[] | null,
  keys?: string[] | undefined
): any => {
  if (!obj)
    throw new ApiError(httpStatus.BAD_REQUEST, "Invalid data in request");

  if (!keys) {
    // TODO: better error logging
    return obj;
  }

  return filteredOutputByBlacklist(obj, keys);
};

export default {
  filteredOutputByBlacklist,
  filteredOutputByWhitelist,
  filteredOutputOrNotFound,
};
