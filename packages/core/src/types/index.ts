export type PartialRecord<K extends keyof any, T> = {
  [P in K]?: T;
};

export type AppScopes = "frontend" | "backend" | "api";

export type ApiConfigImageFormatType = "square" | "normal";

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
  imageType: ApiConfigImageFormatType;
  mimeType: any;
  size: number;
  availableSizes?: Record<string, ApiImageSizeInfo>;
};
