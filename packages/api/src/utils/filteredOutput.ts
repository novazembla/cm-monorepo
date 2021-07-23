import httpStatus from "http-status";
import { ApiError } from "./ApiError";

export type FilterableObject<K extends keyof any, T> = {
  [P in K]?: T;
};

export const filteredOutput = (
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
    return obj.map((item) => filteredOutput(item, keys));
  }

  return Object.keys(obj)
    .filter((k) => !keys.includes(k))
    .reduce(
      (acc, x) =>
        Object.assign(acc, { [x]: filteredOutput((obj as any)[x], keys) }),
      {}
    );
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

  return filteredOutput(obj, keys);
};

export default { filteredOutput };
