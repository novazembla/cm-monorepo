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
}

export enum ImportStatus {
  CREATED,
  ASSIGN,
  PROCESS,
  PROCESSING,
  PROCESSED,
  ERROR,
  DELETED,
}

export default ImageStatus;
