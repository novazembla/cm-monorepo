import {
  filteredOutputByBlacklist,
  filteredOutputByWhitelist,
} from "@culturemap/core";
import httpStatus from "http-status";
import { ApiError } from "./ApiError";

export type FilterableObject<K extends keyof any, T> = {
  [P in K]?: T;
};

export const filteredOutputByBlacklistOrNotFound = (
  obj: object | object[] | null,
  keys?: string[] | undefined
): any => {
  if (!obj) throw new ApiError(httpStatus.NOT_FOUND, "Not found");

  if (!keys) return obj;

  return filteredOutputByBlacklist(obj, keys);
};

export const filteredOutputByWhitelistOrNotFound = (
  obj: object | object[] | null,
  keys?: string[] | undefined
): any => {
  if (!obj) throw new ApiError(httpStatus.NOT_FOUND, "Not found");

  if (!Array.isArray(keys))
    return Array.isArray(obj) ? obj.map(() => ({})) : {};

  return filteredOutputByWhitelist(obj, keys);
};

const defaults = {
  filteredOutputByBlacklist,
  filteredOutputByWhitelist,
  filteredOutputByWhitelistOrNotFound,
  filteredOutputByBlacklistOrNotFound,
};
export default defaults;
