import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { addDays, addMinutes } from "date-fns";
import { roles, RoleNames } from "@culturemap/core";

import { getPrismaClient } from "../db/client";

import config from "../config";
import { AuthPayload } from "../typings/auth";
import { daoTokenCreate, TokenTypes } from "../dao/token";
import { daoUserGetByEmail } from "../dao/user";

import { ApiError } from "../utils";

const prisma = getPrismaClient();

export const generateToken = (
  userId: number,
  role: RoleNames | null,
  expires: Date,
  type: string,
  secret?: string
) => {
  if (!config.env.JWT_SECRET) {
    // TODO: better loggins
    // eslint-disable-next-line no-console
    console.error("Please configure JWT_SECRET");
    throw new ApiError(httpStatus.BAD_REQUEST, "Token not created");
  }

  // expose roles in token TODO: expose roles
  const payload = {
    user: {
      id: userId,
      roles: role ? [role] : [],
      permissions: role ? roles.getExtendedPermissions(role) : [],
    },
    iat: new Date().getTime() / 1000,
    exp: expires.getTime() / 1000,
    type,
  };

  return jwt.sign(payload, secret ?? config.env.JWT_SECRET);
};

export const verifyToken = (token: string): JwtPayload | null => {
  try {
    if (!config.env.JWT_SECRET) {
      // TODO: better loggins
      // eslint-disable-next-line no-console
      console.error("Please configure JWT_SECRET");
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (1)");
    }

    const tokenPayload: JwtPayload | string = jwt.verify(
      token,
      config.env.JWT_SECRET ?? "",
      {}
    );

    if (typeof tokenPayload === "object") {
      if (Date.now() >= (tokenPayload.exp ?? 0) * 1000) {
        throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (2)");
      }
    } else {
      return null;
    }
    return tokenPayload;
  } catch (err) {
    // TODO: better logging here
    // eslint-disable-next-line
    console.error(err);

    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (3)");
  }
};

export const verifyTokenInDB = async (
  token: string,
  type: string
): Promise<JwtPayload | null> => {
  try {
    const tokenPayload = verifyToken(token);

    if (!(tokenPayload as any)?.user?.id)
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (3)");
    const tokenInDB = await prisma.token.findFirst({
      where: {
        token,
        type,
        userId: parseInt((tokenPayload as any).user.id, 10),
      },
    });

    if (!tokenInDB) {
      throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (3)");
    }

    return tokenPayload;
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (4)");
  }
};

export const generateAuthTokens = async (
  userId: number,
  role: RoleNames
): Promise<AuthPayload> => {
  const accessTokenExpires = addMinutes(
    new Date(),
    parseInt(config.env.JWT_ACCESS_EXPIRATION_MINUTES ?? "10", 10)
  );

  const accessToken = generateToken(
    userId,
    role,
    accessTokenExpires,
    TokenTypes.ACCESS
  );

  const refreshTokenExpires = addDays(
    new Date(),
    parseInt(config.env.JWT_REFRESH_EXPIRATION_DAYS ?? "30", 10)
  );

  const refreshToken = generateToken(
    userId,
    role,
    refreshTokenExpires,
    TokenTypes.REFRESH
  );

  await daoTokenCreate(
    refreshToken,
    userId,
    refreshTokenExpires,
    TokenTypes.REFRESH
  );

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
  const user = await daoUserGetByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Email not found");
  }
  const expires = addMinutes(
    new Date(),
    parseInt(config.env.JWT_RESET_PASSWORD_EXPIRATION_MINUTES ?? "30", 10)
  );

  const resetPasswordToken = generateToken(
    user.id,
    null,
    expires,
    TokenTypes.RESET_PASSWORD
  );
  await daoTokenCreate(
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
    parseInt(config.env.JWT_VERIFY_EMAIL_EXPIRATION_MINUTES ?? "240", 10)
  );
  const verifyEmailToken = generateToken(
    userId,
    null,
    expires,
    TokenTypes.VERIFY_EMAIL
  );
  await daoTokenCreate(
    verifyEmailToken,
    userId,
    expires,
    TokenTypes.VERIFY_EMAIL
  );
  return verifyEmailToken;
};

export const processRefreshToken = (
  res: any, // TODO: this should be properly typed
  authPayload: AuthPayload
): AuthPayload => {
  res.cookie("refreshToken", (authPayload as any).tokens.refresh.token, {
    sameSite: "lax",
    httpOnly: true,
    maxAge:
      new Date((authPayload as any).tokens.refresh.expires).getTime() -
      new Date().getTime(),
  });

  // eslint-disable-next-line no-param-reassign
  (authPayload as any).tokens.refresh.token = "content is hidden ;-P";
  return authPayload;
};

export default {
  generateToken,
  verifyToken,
  verifyTokenInDB,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  processRefreshToken,
};
