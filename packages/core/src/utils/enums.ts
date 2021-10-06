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
  UPLOADED,
  ASSIGN,
  PROCESS,
  PROCESSING,
  OK,
  ERROR,
  DELETED,
}

export default ImageStatus;
