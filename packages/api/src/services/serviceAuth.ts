import httpStatus from "http-status";
import { User } from "@prisma/client";
import { JwtPayload } from "jsonwebtoken";
import type {
  RoleNames,
  AppScopes,
  AuthenticatedApiUser,
} from "@culturemap/core";
import { createAuthenticatedApiUser } from "@culturemap/core";
import { AuthenticationError } from "apollo-server-express";

import { AuthPayload } from "../types/auth";
import { TokenTypes, daoTokenDeleteMany } from "../dao/token";

import {
  daoUserGetByLogin,
  daoUserGetById,
  daoUserUpdate,
  daoUserGetByEmail,
} from "../dao/user";
import { ApiError } from "../utils";
import {
  tokenVerify,
  tokenGenerateResetPasswordToken,
  tokenVerifyInDB,
  tokenGenerateAuthTokens,
  tokenGenerateVerifyEmailToken,
} from "./serviceToken";

import { logger } from "./serviceLogging";

import {
  sendResetPasswordEmail,
  sendEmailConfirmationEmail,
} from "./serviceEmail";

export const authSendEmailConfirmationEmail = async (
  scope: AppScopes,
  userId: number,
  email: string
) => {
  const emailVerificationToken = await tokenGenerateVerifyEmailToken(
    scope,
    userId
  );

  sendEmailConfirmationEmail(scope, email, emailVerificationToken);
  return true;
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
            "permissions" in (tokenPayload as JwtPayload).user &&
            "scope" in (tokenPayload as JwtPayload).user
          )
        )
          return null;

        return createAuthenticatedApiUser(
          (tokenPayload as JwtPayload).user.id,
          (tokenPayload as JwtPayload).user.roles,
          (tokenPayload as JwtPayload).user.permissions,
          (tokenPayload as JwtPayload).user.scope
        );
      }
    }
  } catch (err) {
    logger.debug(`[auth.authenticateUserByToken]: ${err.name}: ${err.message}`);
  }

  return null;
};

export const authLoginUserWithEmailAndPassword = async (
  scope: string,
  email: string,
  password: string
): Promise<AuthPayload> => {
  const user = await daoUserGetByLogin(email, password);

  if (!user) {
    throw new AuthenticationError("Incorrect email or password");
  }

  if (user.userBanned)
    throw new ApiError(httpStatus.UNAUTHORIZED, "[auth] Access denied");

  daoTokenDeleteMany({
    userId: user.id,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  const authPayload: AuthPayload = await tokenGenerateAuthTokens(
    scope,
    {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    user.role as RoleNames
  );

  authPayload.user = user;

  return authPayload;
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

export const authRefresh = async (scope: string, refreshToken: string) => {
  try {
    const tokenPayload = await tokenVerifyInDB(
      refreshToken,
      TokenTypes.REFRESH
    );

    const user: User = await daoUserGetById(
      (tokenPayload as JwtPayload).user.id
    );
    if (!user) {
      throw new ApiError(
        httpStatus.FORBIDDEN,
        "[auth.authRefresh] Please authenticate (1)"
      );
    }

    if (user.userBanned)
      throw new ApiError(httpStatus.FORBIDDEN, "[auth] Access denied");

    await daoTokenDeleteMany({
      userId: user.id,
      type: TokenTypes.REFRESH,
    });

    return await tokenGenerateAuthTokens(
      scope,
      {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      user.role as RoleNames
    );
  } catch (error) {
    throw new ApiError(
      httpStatus.FORBIDDEN,
      "[auth.authRefresh] Please authenticate (2)"
    );
  }
};

export const authRequestPasswordResetEmail = async (
  scope: AppScopes,
  email: string
): Promise<boolean> => {
  try {
    const userInDB = await daoUserGetByEmail(email);

    const passwordResetToken = await tokenGenerateResetPasswordToken(
      scope,
      userInDB.email
    );

    sendResetPasswordEmail(scope, email, passwordResetToken);

    return true;
  } catch (error) {
    logger.warn(error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "[auth.authRequestPasswordReset] Password reset request failed"
    );
  }
};

export const authRequestEmailVerificationEmail = async (
  scope: AppScopes,
  userId: number
): Promise<boolean> => {
  try {
    const userInDb = await daoUserGetById(userId);

    if (userInDb)
      return await authSendEmailConfirmationEmail(
        scope,
        userInDb.id,
        userInDb.email
      );

    return false;
  } catch (error) {
    logger.warn(error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "[auth.authRequestEmailVerificationEmail] Email verification request failed"
    );
  }
};

export const authResetPassword = async (
  password: string,
  token: string
): Promise<boolean> => {
  try {
    const tokenPayload = await tokenVerifyInDB(
      token,
      TokenTypes.RESET_PASSWORD
    );

    if (
      tokenPayload &&
      "user" in (tokenPayload as JwtPayload) &&
      "id" in (tokenPayload as JwtPayload).user
    ) {
      const user = await daoUserGetById((tokenPayload as JwtPayload).user.id);

      await daoUserUpdate(user.id, { password });

      daoTokenDeleteMany({
        userId: user.id,
        type: {
          in: [
            TokenTypes.RESET_PASSWORD,
            TokenTypes.ACCESS,
            TokenTypes.REFRESH,
          ],
        },
      });

      return true;
    }

    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "[auth.authRefresh] Token validation failed"
    );
  } catch (error) {
    logger.warn(error);
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "[auth.authResetPassword] Password reset failed"
    );
  }
};

export const authVerifyEmail = async (token: string) => {
  try {
    const tokenPayload = await tokenVerifyInDB(token, TokenTypes.VERIFY_EMAIL);
    if (
      tokenPayload &&
      "user" in (tokenPayload as JwtPayload) &&
      "id" in (tokenPayload as JwtPayload).user
    ) {
      daoTokenDeleteMany({
        userId: (tokenPayload as JwtPayload).id,
        type: TokenTypes.VERIFY_EMAIL,
      });
      await daoUserUpdate((tokenPayload as JwtPayload).user.id, {
        emailVerified: true,
      });

      return true;
    }

    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "[auth.authVerifyEmail] Token validation failed"
    );
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

export default {
  authAuthenticateUserByToken,
  authLoginUserWithEmailAndPassword,
  authLogout,
  authRefresh,
  authRequestPasswordResetEmail,
  authRequestEmailVerificationEmail,
  authResetPassword,
  authSendEmailConfirmationEmail,
  authVerifyEmail,
};
