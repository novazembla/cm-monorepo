import httpStatus from "http-status";
import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import type { RoleNames, PermisionsNames } from "@culturemap/core";
import { AuthenticationError } from "apollo-server-express";

import { AuthPayload } from "../typings/auth";

import { TokenTypes, daoTokenDeleteMany } from "../dao/token";
import { daoUserGetByLogin, daoUserGetById, daoUserUpdate } from "../dao/user";
import { ApiError } from "../utils";
import {
  tokenVerify,
  tokenVerifyInDB,
  tokenGenerateAuthTokens,
} from "./serviceToken";
import { logger } from "./serviceLogging";

export interface AuthenticatedApiUser {
  id: number;
  roles: RoleNames[];
  permissions: PermisionsNames[];
  has(name: RoleNames): boolean;
  can(permissions: PermisionsNames | PermisionsNames[]): boolean;
}

export const authGenerateAuthenticatedApiUser = (
  id: number,
  roles: RoleNames[],
  permissions: PermisionsNames[]
): AuthenticatedApiUser => {
  const user: AuthenticatedApiUser = {
    id,
    roles,
    permissions,
    has(name: RoleNames) {
      return (this.roles &&
        Array.isArray(this.roles) &&
        this.roles.indexOf(name) > -1) as boolean;
    },
    can(perms: PermisionsNames | PermisionsNames[]) {
      return (Array.isArray(perms) ? perms : [perms]).some(
        (perm) => this.permissions.indexOf(perm) !== -1
      );
    },
  };

  return user;
};

export const authAuthenticateUserByToken = (
  token: string
): AuthenticatedApiUser | null => {
  try {
    const tokenPayload = tokenVerify(token);

    if (tokenPayload) {
      if ("user" in (tokenPayload as JwtPayload)) {
        if (
          !(
            "id" in (tokenPayload as JwtPayload).user &&
            "roles" in (tokenPayload as JwtPayload).user &&
            "permissions" in (tokenPayload as JwtPayload).user
          )
        )
          return null;

        return authGenerateAuthenticatedApiUser(
          (tokenPayload as JwtPayload).user.id,
          (tokenPayload as JwtPayload).user.roles,
          (tokenPayload as JwtPayload).user.permissions
        );
      }
    }
  } catch (err) {
    logger.debug(`[auth.authenticateUserByToken]: ${err.name}: ${err.message}`);
  }

  return null;
};

export const authLoginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<AuthPayload> => {
  const user = await daoUserGetByLogin(email, password);

  if (!user) {
    throw new AuthenticationError("Incorrect email or password");
  }

  daoTokenDeleteMany({
    userId: user.id,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  const authpayload: AuthPayload = await tokenGenerateAuthTokens(
    user.id,
    user.role as RoleNames
  );
  authpayload.user = user;

  return authpayload;
};

export const authLogout = async (userId: number): Promise<boolean> => {
  daoTokenDeleteMany({
    userId,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  return true;
};

export const authRefresh = async (refreshToken: string) => {
  try {
    const tokenPayload = await tokenVerifyInDB(
      refreshToken,
      TokenTypes.REFRESH
    );

    const user: User = await daoUserGetById((tokenPayload as any).user.id);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate (1)");
    }

    await daoTokenDeleteMany({
      userId: user.id,
      type: TokenTypes.REFRESH,
    });

    return await tokenGenerateAuthTokens(user.id, user.role as RoleNames);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate (2)");
  }
};

/**
 * Reset password TODO: xxx123
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
export const authResetPassword = async (
  resetPasswordToken: string,
  newPassword: string
) => {
  try {
    const tokenPayload = await tokenVerifyInDB(
      resetPasswordToken,
      TokenTypes.RESET_PASSWORD
    );
    const user = await daoUserGetById((tokenPayload as any).user.id);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
    }
    await daoUserUpdate(user.id, { password: newPassword });

    daoTokenDeleteMany({
      userId: user.id,
      type: TokenTypes.RESET_PASSWORD,
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Password reset failed");
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
export const authVerifyEmail = async (emailVerificationToken: string) => {
  try {
    const tokenPayload = await tokenVerifyInDB(
      emailVerificationToken,
      TokenTypes.VERIFY_EMAIL
    );
    const user: User = await daoUserGetById((tokenPayload as any).user.id); // TODO: crate type for token payload and replace as any
    if (!user) {
      throw new Error();
    }

    daoTokenDeleteMany({
      userId: user.id,
      type: TokenTypes.VERIFY_EMAIL,
    });

    daoUserUpdate(user.id, { emailConfirmed: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

export default {
  authAuthenticateUserByToken,
  authLoginUserWithEmailAndPassword,
  authLogout,
  authRefresh,
  authResetPassword,
  authVerifyEmail,
};
