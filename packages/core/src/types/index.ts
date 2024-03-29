export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

export const TsEnsureArrayOfAll =
  <T>() =>
  <U extends T[]>(array: U & ([T] extends [U[number]] ? unknown : "Invalid")) =>
    array;

export type AppScopes = "frontend" | "backend" | "api";

export type ApiImageSizeInfoType = "square" | "normal";

export type ApiImageSizeInfo = {
  width: number;
  height: number;
  url: string;
  isJpg: boolean;
  isWebP: boolean;
};

export interface ApiImageFormatInfo {
  width: number;
  height: number;
  crop: boolean;
  asWebP: boolean;
  asJpg: boolean;
}

export type ApiImageMetaInformation = {
  uploadFolder: string;
  originalFileName: string;
  originalFileUrl: string;
  originalFilePath: string;
  imageType: ApiImageSizeInfoType;
  mimeType: any;
  size: number;
  availableSizes?: Record<string, ApiImageSizeInfo>;
};

export type ApiFileMetaInformation = {
  uploadFolder: string;
  originalFileName: string;
  originalFileUrl: string;
  originalFilePath: string;
  mimeType: any;
  size: number;
};
