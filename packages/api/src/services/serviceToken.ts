import jwt, { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { addDays, addMinutes } from "date-fns";
import {
  roles,
  RoleNames,
  JwtPayloadAuthenticatedApiUser,
} from "@culturemap/core";
import { Response } from "express";

import { getApiConfig } from "../config";
import { AuthPayload } from "../types/auth";
import { daoTokenCreate, daoTokenQueryFirst } from "../dao/token";
import { daoUserGetByEmail } from "../dao/user";

import { ApiError, TokenTypes } from "../utils";

import { logger } from "./serviceLogging";

export const generateToken = (
  scope: string,
  payloadUser: JwtPayloadAuthenticatedApiUser,
  role: RoleNames | null,
  expires: Date,
  type: string,
  secret?: string
) => {
  const apiConfig = getApiConfig();

  let user: JwtPayloadAuthenticatedApiUser = {
    id: payloadUser.id,
    scope,
  };

  if (payloadUser.firstName)
    user = {
      ...user,
      firstName: payloadUser.firstName,
    };

  if (payloadUser.lastName)
    user = {
      ...user,
      lastName: payloadUser.lastName,
    };

  if (role) {
    if (type === "access")
      user = {
        ...user,
        ...{
          role,
          roles: role ? roles.getExtendedRoles(role) : [],
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

    if (type === "preview")
      user = {
        ...user,
        ...{
          roles: ["preview"],
          permissions: (role ? roles.getExtendedPermissions(role) : []).filter(
            (p) => p.indexOf("Read") > -1 || p.indexOf("ReadOwn") > -1
          ),
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

  return jwt.sign(payload, secret ?? apiConfig.jwt.secret);
};

export const tokenVerify = (token: string): JwtPayload | null => {
  const apiConfig = getApiConfig();

  try {
    if (!apiConfig.jwt.secret) {
      const msg = "Please configure your JWT Secret";
      logger.info(`Error: ${msg}`);
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "(VT 1)");
    }

    const tokenPayload: JwtPayload | string = jwt.verify(
      token,
      apiConfig.jwt.secret ?? "",
      {}
    );

    if (typeof tokenPayload === "object") {
      if (Date.now() >= (tokenPayload.exp ?? 0) * 1000) {
        logger.debug(`Error: Token expired (VT 2)`);
        throw new ApiError(httpStatus.UNAUTHORIZED, "(VT 2)");
      }
    } else {
      return null;
    }
    return tokenPayload;
  } catch (err: any) {
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Token not authorized (${err.message})`
    );
  }
};

export const tokenVerifyInDB = async (
  token: string,
  type: string
): Promise<JwtPayload | null> => {
  try {
    const tokenPayload = tokenVerify(token);

    if (!(tokenPayload as any)?.user?.id) {
      logger.debug(`Error: Supplied token incomplete (VTDB 1)`);
      throw new ApiError(httpStatus.UNAUTHORIZED, "VTDB 1");
    }

    // this should be dao

    const tokenInDB = await daoTokenQueryFirst({
      token,
      type,
      userId: parseInt((tokenPayload as any).user.id, 10),
    });

    if (!tokenInDB) {
      logger.debug({
        token,
        type,
        userId: parseInt((tokenPayload as any).user.id, 10),
      });
      logger.debug(`Error: Token not found (VTDB 2)`);
      throw new ApiError(httpStatus.UNAUTHORIZED, "VTDB 2");
    }

    return tokenPayload;
  } catch (err: any) {
    logger.debug(`Token not authorized (${err.message})`);
    throw new ApiError(
      httpStatus.UNAUTHORIZED,
      `Token not authorized (${err.message})`
    );
  }
};

export const tokenGenerateAuthTokens = async (
  scope: string,
  user: JwtPayloadAuthenticatedApiUser,
  role: RoleNames
): Promise<AuthPayload> => {
  const apiConfig = getApiConfig();

  const accessTokenExpires = addMinutes(
    new Date(),
    apiConfig.jwt.expiration.access
  );

  const previewTokenExpires = addMinutes(
    new Date(),
    apiConfig.jwt.expiration.preview
  );

  const accessToken = generateToken(
    scope,
    user,
    role,
    accessTokenExpires,
    TokenTypes.ACCESS
  );

  const previewToken = generateToken(
    scope,
    user,
    role,
    previewTokenExpires,
    TokenTypes.PREVIEW
  );

  const refreshTokenExpires = addDays(
    new Date(),
    apiConfig.jwt.expiration.refresh
  );

  const refreshToken = generateToken(
    scope,
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
      preview: {
        token: previewToken,
        expires: previewTokenExpires.toISOString(),
      },
    },
  };
  return authPayload;
};

export const tokenGenerateResetPasswordToken = async (
  scope: string,
  email: string
) => {
  const apiConfig = getApiConfig();

  const user = await daoUserGetByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "Email not found");
  }
  const expires = addMinutes(
    new Date(),
    apiConfig.jwt.expiration.passwordReset
  );

  const resetPasswordToken = generateToken(
    scope,
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

export const tokenGenerateVerifyEmailToken = async (
  scope: string,
  userId: number
) => {
  const apiConfig = getApiConfig();

  const expires = addDays(
    new Date(),
    apiConfig.jwt.expiration.emailConfirmation
  );
  const verifyEmailToken = generateToken(
    scope,
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
  const apiConfig = getApiConfig();

  const secureCookie = apiConfig.baseUrl.api.indexOf("localhost") === -1;

  res.cookie("refreshToken", (authPayload as any).tokens.refresh.token, {
    sameSite: secureCookie ? "none" : "lax",
    secure: secureCookie ?? undefined,
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
  const apiConfig = getApiConfig();

  const secureCookie = apiConfig.baseUrl.api.indexOf("localhost") === -1;
  res.cookie("refreshToken", "", {
    sameSite: secureCookie ? "none" : "lax",
    secure: secureCookie ?? undefined,
    httpOnly: true,
    maxAge: 0,
  });
};

const defaults = {
  generateToken,
  tokenVerify,
  tokenVerifyInDB,
  tokenGenerateAuthTokens,
  tokenGenerateResetPasswordToken,
  tokenGenerateVerifyEmailToken,
  tokenProcessRefreshToken,
};
export default defaults;
