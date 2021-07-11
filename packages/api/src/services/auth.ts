import httpStatus from "http-status";
import { User } from "@prisma/client";

import { AuthPayload } from "../typings/auth";

import { TokenTypes, deleteManyTokens } from "../dao/token";
import { getUserByLogin, getUserById, updateUserById } from "../dao/user";
import { ApiError } from "../utils";
import { verifyToken, generateAuthTokens } from "./token";

export const loginUserWithEmailAndPassword = async (
  email: string,
  password: string
): Promise<AuthPayload> => {
  const user: User = await getUserByLogin(email, password);

  if (!user) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect email or password");
  }

  deleteManyTokens({
    userId: user.id,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  const authpayload: AuthPayload = await generateAuthTokens(user.id);
  authpayload.user = user;

  return authpayload;
};

export const logout = async (userId: number): Promise<boolean> => {
  deleteManyTokens({
    userId,
    type: {
      in: [TokenTypes.REFRESH, TokenTypes.ACCESS],
    },
  });

  return true;
};

/**
 * Reset password TODO: xxx123
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
export const refreshAuth = async (refreshToken: string) => {
  try {
    const tokenPayload = verifyToken(refreshToken, TokenTypes.REFRESH);
    const user: User = await getUserById((tokenPayload as any).user.id);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
    }

    await deleteManyTokens({
      token: refreshToken,
      userId: user.id,
      type: TokenTypes.REFRESH,
    });

    return await generateAuthTokens(user.id);
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
  }
};

/**
 * Reset password TODO: xxx123
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
export const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const tokenPayload = verifyToken(
      resetPasswordToken,
      TokenTypes.RESET_PASSWORD
    );
    const user = await getUserById((tokenPayload as any).user.id);
    if (!user) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Please authenticate");
    }
    await updateUserById(user.id, { password: newPassword });

    deleteManyTokens({
      token: resetPasswordToken,
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
export const verifyEmail = async (verifyEmailToken) => {
  try {
    const tokenPayload = verifyToken(verifyEmailToken, TokenTypes.VERIFY_EMAIL);
    const user: User = await getUserById((tokenPayload as any).user.id); // TODO: crate type for token payload and replace as any
    if (!user) {
      throw new Error();
    }

    deleteManyTokens({
      token: verifyEmailToken,
      userId: user.id,
      type: TokenTypes.VERIFY_EMAIL,
    });

    updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Email verification failed");
  }
};

export default {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  resetPassword,
  verifyEmail,
};
