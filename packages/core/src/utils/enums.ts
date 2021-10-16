export enum ImageStatus {
  UPLOADED,
  PROCESSING,
  FAILEDRETRY,
  ERROR,
  READY,
  TRASHED,
  DELETED,
}

export enum FileStatus {
  UPLOADED,
  PROCESSING,
  OK,
  ERROR,
  DELETED,
}

export enum PublishStatus {
  AUTODRAFT,
  DRAFT,
  FORREVIEW,
  REJECTED,
  PUBLISHED,
  TRASHED,
  DELETED,
  IMPORTED,
  IMPORTEDWARNINGS,
}

export enum ImportStatus {
  CREATED, // 0
  ASSIGN, // 1
  PROCESS, // 2
  PROCESSING, // 3
  PROCESSED, // 4
  ERROR, // 5
  DELETED, // 6
}

export enum ExportStatus {
  CREATED, // 0
  PROCESS, // 1
  PROCESSING, // 2
  PROCESSED, // 3
  ERROR, // 4
  DELETED, // 5
}

export default ImageStatus;
