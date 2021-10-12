import "./missing/graceful";
import "./missing/isEmail";

export type Complete<T> = {
  [P in keyof Required<T>]: Pick<T, P> extends Required<Pick<T, P>>
    ? T[P]
    : T[P] | undefined;
};

export type ApiImageFormats = "square" | "normal";

export type ApiImageSizeInfo = {
  width: number;
  height: number;
  url: string;
  isJpg: boolean;
  isWebP: boolean;
};

export type ApiImageMetaInformation = {
  uploadFolder: string;
  originalFileName: string;
  originalFileUrl: string;
  originalFilePath: string;
  mimeType: any;
  imageType: ApiImageFormats;
  size: number;
  availableSizes?: Record<string, ApiImageSizeInfo>;
};

export interface GeoLocation {
  lat: number | undefined;
  lng: number | undefined;
}

export interface Address {
  co?: string | undefined;
  street1: string | undefined;
  street2?: string | undefined;
  houseNumber?: string | undefined;
  postCode?: string | undefined;
  city?: string | undefined;
  state?: string | undefined;
  country?: string | undefined;
}
