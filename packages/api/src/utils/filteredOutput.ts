import {
  filteredOutputByBlacklist,
  filteredOutputByWhitelist,
} from "@culturemap/core";

export type FilterableObject<K extends keyof any, T> = {
  [P in K]?: T;
};

export const filteredOutputByBlacklistOrNotFound = (
  obj: object | object[] | null,
  keys?: string[] | undefined
): any => {
  if (!obj) return obj;

  if (!keys) {
    // TODO: better error logging
    return obj;
  }

  return filteredOutputByBlacklist(obj, keys);
};

export const filteredOutputByWhitelistOrNotFound = (
  obj: object | object[] | null,
  keys?: string[] | undefined
): any => {
  if (!obj) return obj;

  if (!keys) {
    // TODO: better error logging
    return obj;
  }

  return filteredOutputByWhitelist(obj, keys);
};

export default {
  filteredOutputByBlacklist,
  filteredOutputByWhitelist,
  filteredOutputByWhitelistOrNotFound,
  filteredOutputByBlacklistOrNotFound,
};
