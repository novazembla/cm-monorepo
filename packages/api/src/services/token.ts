import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { addDays, addMinutes } from "date-fns";
import { roles, RoleNames } from "@culturemap/core";
import { Response } from "express";

import config from "../config";
import { AuthPayload } from "../typings/auth";
import { daoTokenCreate, TokenTypes, daoTokenFindFirst } from "../dao/token";
import { daoUserGetByEmail } from "../dao/user";

import { ApiError } from "../utils";
import { logger } from "./logging";

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
    logger.error("Please configure JWT_SECRET");
    throw new ApiError(httpStatus.BAD_REQUEST, "Token not created");
  }

  let user = {
    id: userId,
  };

  if (role) {
    user = {
      ...user,
      ...{
        roles: role ? [role] : [],
        permissions: role ? roles.getExtendedPermissions(role) : [],
      },
    };
  }
  // expose roles in token TODO: expose roles
  const payload = {
    user,
    iat: new Date().getTime() / 1000,
    exp: expires.getTime() / 1000,
    type,
  };

  return jwt.sign(payload, secret ?? config.env.JWT_SECRET);
};

export const tokenVerify = (token: string): JwtPayload | null => {
  try {
    if (!config.env.JWT_SECRET) {
      const msg = "Please configure your JWT Secret";
      logger.info(`Error: ${msg}`);

      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Token not authorized (VT 1)"
      );
    }

    const tokenPayload: JwtPayload | string = jwt.verify(
      token,
      config.env.JWT_SECRET ?? "",
      {}
    );

    if (typeof tokenPayload === "object") {
      if (Date.now() >= (tokenPayload.exp ?? 0) * 1000) {
        throw new ApiError(
          httpStatus.UNAUTHORIZED,
          "Token not authorized (VT 2)"
        );
      }
    } else {
      return null;
    }
    return tokenPayload;
  } catch (err) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Token not authorized (VT 3)");
  }
};

export const tokenVerifyInDB = async (
  token: string,
  type: string
): Promise<JwtPayload | null> => {
  try {
    const tokenPayload = tokenVerify(token);

    if (!(tokenPayload as any)?.user?.id)
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token not authorized (VTDB 1)"
      );

    // this should be dao

    const tokenInDB = await daoTokenFindFirst({
      token,
      type,
      userId: parseInt((tokenPayload as any).user.id, 10),
    });

    if (!tokenInDB) {
      throw new ApiError(
        httpStatus.UNAUTHORIZED,
        "Token not authorized (VTDB 2)"
      );
    }

    return tokenPayload;
  } catch (err) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      "Token not authorized (VTDB 3)"
    );
  }
};

export const tokenGenerateAuthTokens = async (
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

export const tokenGenerateResetPasswordToken = async (email: string) => {
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

const tokenGenerateVerifyEmailToken = async (userId: number) => {
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

export const tokenProcessRefreshToken = (
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

export const tokenClearRefreshToken = (res: Response): void => {
  res.cookie("refreshToken", "", {
    sameSite: "lax",
    httpOnly: true,
    maxAge: 0,
  });
};

export default {
  generateToken,
  tokenVerify,
  tokenVerifyInDB,
  tokenGenerateAuthTokens,
  tokenGenerateResetPasswordToken,
  tokenGenerateVerifyEmailToken,
  tokenProcessRefreshToken,
};
