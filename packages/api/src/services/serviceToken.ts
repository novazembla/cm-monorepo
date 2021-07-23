import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { addDays, addMinutes } from "date-fns";
import { roles, RoleNames } from "@culturemap/core";
import { Response } from "express";

import config from "../config";
import { AuthPayload, JwtTokenPayloadUser } from "../types/auth";
import { daoTokenCreate, TokenTypes, daoTokenFindFirst } from "../dao/token";
import { daoUserGetByEmail } from "../dao/user";

import { ApiError } from "../utils";
import { logger } from "./serviceLogging";

export const generateToken = (
  payloadUser: JwtTokenPayloadUser,
  role: RoleNames | null,
  expires: Date,
  type: string,
  secret?: string
) => {
  let user: JwtTokenPayloadUser = {
    id: payloadUser.id,
  };

  if (role) {
    if (type === "access")
      user = {
        ...user,
        ...{
          roles: role ? [role] : [],
          permissions: role ? roles.getExtendedPermissions(role) : [],
        },
      };

    // the refresh token should only grant the minimal permissions
    if (type === "refresh")
      user = {
        ...user,
        ...{
          roles: ["refresh"],
          permissions: roles.getExtendedPermissions("refresh"),
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

  return jwt.sign(payload, secret ?? config.jwt.secret);
};

export const tokenVerify = (token: string): JwtPayload | null => {
  try {
    if (!config.jwt.secret) {
      const msg = "Please configure your JWT Secret";
      logger.info(`Error: ${msg}`);

      throw new ApiError(
        httpStatus.INTERNAL_SERVER_ERROR,
        "Token not authorized (VT 1)"
      );
    }

    const tokenPayload: JwtPayload | string = jwt.verify(
      token,
      config.jwt.secret ?? "",
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
  user: JwtTokenPayloadUser,
  role: RoleNames
): Promise<AuthPayload> => {
  const accessTokenExpires = addMinutes(
    new Date(),
    config.jwt.expiration.access
  );

  const accessToken = generateToken(
    user,
    role,
    accessTokenExpires,
    TokenTypes.ACCESS
  );

  const refreshTokenExpires = addDays(
    new Date(),
    config.jwt.expiration.refresh
  );

  const refreshToken = generateToken(
    {
      id: user.id,
    },
    role,
    refreshTokenExpires,
    TokenTypes.REFRESH
  );

  await daoTokenCreate(
    refreshToken,
    user.id,
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
  const expires = addMinutes(new Date(), config.jwt.expiration.passwordReset);

  const resetPasswordToken = generateToken(
    {
      id: user.id,
    },
    "api",
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

export const tokenGenerateVerifyEmailToken = async (userId: number) => {
  const expires = addMinutes(
    new Date(),
    config.jwt.expiration.emailConfirmation
  );
  const verifyEmailToken = generateToken(
    {
      id: userId,
    },
    "api",
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
