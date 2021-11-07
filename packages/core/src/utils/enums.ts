export enum ImageStatus {
  UPLOADED, // 0
  PROCESSING, // 1
  FAILEDRETRY, // 2
  ERROR, // 3
  READY, // 4
  TRASHED, // 5
  DELETED, // 6
}

export enum FileStatus {
  UPLOADED, // 0
  PROCESSING, // 1
  OK, // 2
  ERROR, // 3
  DELETED, // 4
}

export enum PublishStatus {
  AUTODRAFT, // 0
  DRAFT, // 1
  FORREVIEW, // 2
  REJECTED, // 3
  PUBLISHED, // 4
  TRASHED, // 5
  DELETED, // 6
  IMPORTED, // 7
  IMPORTEDWARNINGS, // 8
  SUGGESTION, // 9
}

export enum DataImportStatus {
  CREATED, // 0
  ASSIGN, // 1
  PROCESS, // 2
  PROCESSING, // 3
  PROCESSED, // 4
  ERROR, // 5
  DELETED, // 6
}

export enum DataExportStatus {
  CREATED, // 0
  PROCESS, // 1
  PROCESSING, // 2
  PROCESSED, // 3
  ERROR, // 4
  DELETED, // 5
}

export enum ImageCropPosition {
  CENTER, // 0
  TOP, // 1
  RIGHT, // 2
  BOTTOM, // 3
  LEFT, // 4
}

export default ImageStatus;
