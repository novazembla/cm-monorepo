import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { addDays, addMinutes } from "date-fns";

import { getPrismaClient } from "../db/client";

import config from "../config";
import { AuthPayload } from "../typings/auth";
import { saveToken, TokenTypes } from "../dao/token";
import { getUserByEmail } from "../dao/user";

import { ApiError } from "../utils";

const prisma = getPrismaClient();

export const generateToken = (
  userId: number,
  expires: Date,
  type: string,
  secret: string = config.env.JWT_SECRET
) => {
  // expose roles in token TODO: expose roles
  const payload = {
    user: {
      id: userId,
      roles: ["ADMINISTRATOR"],
      permissions: ["X1", "X2"],
    },
    iat: new Date().getTime() / 1000,
    exp: expires.getTime() / 1000,
    type,
  };
  return jwt.sign(payload, secret);
};
export const verifyToken = async (
  token: string
): Promise<JwtPayload | string> => {
  try {
    const tokenPayload = jwt.verify(token, config.env.JWT_SECRET, {});

    if (Date.now() >= (tokenPayload as JwtPayload).exp * 1000) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
    }

    return tokenPayload;
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
  }
};

export const verifyTokenInDB = async (
  token: string,
  type: string
): Promise<JwtPayload | string> => {
  try {
    const tokenPayload = jwt.verify(token, config.env.JWT_SECRET, {});

    if (Date.now() >= (tokenPayload as JwtPayload).exp * 1000) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
    }

    const tokenDoc = await prisma.token.findFirst({
      where: {
        token,
        type,
        userId: parseInt((tokenPayload as any).user.id, 10),
        blacklisted: false,
      },
    });
    if (!tokenDoc) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
    }
    return tokenPayload;
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized");
  }
};

export const generateAuthTokens = async (
  userId: number
): Promise<AuthPayload> => {
  const accessTokenExpires = addMinutes(
    new Date(),
    parseInt(config.env.JWT_ACCESS_EXPIRATION_MINUTES, 10)
  );

  const accessToken = generateToken(
    userId,
    accessTokenExpires,
    TokenTypes.ACCESS
  );

  const refreshTokenExpires = addDays(
    new Date(),
    parseInt(config.env.JWT_REFRESH_EXPIRATION_DAYS, 10)
  );

  const refreshToken = generateToken(
    userId,
    refreshTokenExpires,
    TokenTypes.REFRESH
  );

  saveToken(refreshToken, userId, refreshTokenExpires, TokenTypes.REFRESH);

  const authPayload: AuthPayload = {
    user: undefined,
    tokens: {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toISOString(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toISOString(),
      },
    },
  };
  return authPayload;
};

export const generateResetPasswordToken = async (email: string) => {
  const user = await getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Email not found");
  }
  const expires = addMinutes(
    new Date(),
    parseInt(config.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES, 10)
  );

  const resetPasswordToken = generateToken(
    user.id,
    expires,
    TokenTypes.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    TokenTypes.RESET_PASSWORD
  );
  return resetPasswordToken;
};

const generateVerifyEmailToken = async (userId: number) => {
  const expires = addMinutes(
    new Date(),
    parseInt(config.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES, 10)
  );
  const verifyEmailToken = generateToken(
    userId,
    expires,
    TokenTypes.VERIFY_EMAIL
  );
  saveToken(verifyEmailToken, userId, expires, TokenTypes.VERIFY_EMAIL);
  return verifyEmailToken;
};

export default {
  generateToken,
  verifyToken,
  verifyTokenInDB,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
};
