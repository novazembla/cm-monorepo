import { PartialRecord, RoleNames } from "@culturemap/core";

export interface JwtTokenPayloadUser {
  id: number;
  firstName?: string;
  lastName?: string;
  roles?: RoleNames[];
  permissions?: string[];
}

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
  user: JwtTokenPayloadUser | undefined;
  tokens: PartialRecord<AuthTokenType, AuthPayloadToken>;
};
