import httpStatus from "http-status";
import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import { RoleNames } from "@culturemap/core";

import { AuthPayload } from "../typings/auth";

import { TokenTypes, daoTokenDeleteMany } from "../dao/token";
import { daoUserGetByLogin, daoUserGetById, daoUserUpdate } from "../dao/user";
import { ApiError } from "../utils";
import { verifyToken, verifyTokenInDB, generateAuthTokens } from "./token";

export interface AuthenticatedApiUser {
  id: number;
  roles: string[];
  permissions: string[];
  has: (name: RoleNames) => boolean;
  can: (permission: string) => boolean;
}

export const generateAuthenticatedApiUser = (
  id: number,
  roles: string[],
  permissions: string[]
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
    can(permission: string) {
      return (this.permissions &&
        Array.isArray(this.permissions) &&
        this.permissions.indexOf(permission) > -1) as boolean;
    },
  };

  return user;
};

export const authenticateUserByToken = (
  token: string
): AuthenticatedApiUser | null => {
  const tokenPayload = verifyToken(token);

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

      return generateAuthenticatedApiUser(
        (tokenPayload as JwtPayload).user.id,
        (tokenPayload as JwtPayload).user.roles,
        (tokenPayload as JwtPayload).user.permissions
      );
    }
  }

  return null;
};

export const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<AuthPayload> => {
  const user = await daoUserGetByLogin(email, password);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  daoTokenDeleteMany({
    userId: user.id,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  const authpayload: AuthPayload = await generateAuthTokens(
    user.id,
    user.role as RoleNames
  );
  authpayload.user = user;

  return authpayload;
};

export const logout = async (userId: number): Promise<boolean> => {
  daoTokenDeleteMany({
    userId,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  return true;
};

export const refreshAuth = async (refreshToken: string) => {
  try {
    const tokenPayload = await verifyTokenInDB(
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

    return await generateAuthTokens(user.id, user.role as RoleNames);
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
export const resetPassword = async (
  resetPasswordToken: string,
  newPassword: string
) => {
  try {
    const tokenPayload = await verifyTokenInDB(
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
export const verifyEmail = async (emailVerificationToken: string) => {
  try {
    const tokenPayload = await verifyTokenInDB(
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
  authenticateUserByToken,
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
