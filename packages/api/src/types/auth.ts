import {
  PartialRecord,
  JwtPayloadAuthenticatedApiUser,
} from "@culturemap/core";

export type AuthTokenType =
  | "access"
  | "refresh"
  | "resetPassword"
  | "verifyEmail";

export type AuthPayloadToken = {
  token: string;
  expires: string;
};

export type AuthPayload = {
  user: JwtPayloadAuthenticatedApiUser | undefined;
  tokens: PartialRecord<AuthTokenType, AuthPayloadToken>;
};
