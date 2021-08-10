export enum ImageStatusEnum {
  UPLOADED,
  PROCESSING,
  ERROR,
  READY,
}

// convert TokenTypes to int ... TODO:
export enum TokenTypes {
  ACCESS = "access",
  REFRESH = "refresh",
  RESET_PASSWORD = "resetPassword",
  VERIFY_EMAIL = "verifyEmail",
}
