import { Request, Response } from "express";
import { AuthenticatedApiUser } from "@culturemap/core";

import { logger } from "../services/serviceLogging";

import { authAuthenticateUserByToken } from "../services/serviceAuth";

export interface NexusResolverContext {
  req: Request;
  res: Response;
  apiUser: AuthenticatedApiUser | null;
  queryStartsWith: string;
  tokenInfo: {
    accessTokenProvided: boolean;
    refreshTokenProvided: boolean;
    validAccessTokenProvided: boolean;
    validRefreshTokenProvided: boolean;
  };
}

export const context = ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): NexusResolverContext => {
  let apiUser: AuthenticatedApiUser | null = null;
  let accessTokenProvided = false;
  let refreshTokenProvided = false;
  let validAccessTokenProvided = false;
  let validRefreshTokenProvided = false;

  const queryStartsWith = req?.body?.query
    ? req.body.query
        .replace("\t", "")
        .replace("  ", " ")
        .replace("\n", "")
        .substring(0, 40)
    : "no query passed in the body";

  let accessToken = req?.headers?.authorization ?? "";
  if (accessToken) {
    accessTokenProvided = true;

    try {
      if (accessToken.indexOf("Bearer") > -1)
        accessToken = accessToken.replace(/(Bearer:? )/g, "");

      apiUser = authAuthenticateUserByToken(accessToken);

      if (apiUser) {
        validAccessTokenProvided = true;
      } else {
        logger.warn("Authentication token invalid in context (1)");
      }
    } catch (Err) {
      logger.warn("Authentication token invalid in context (2)");
    }
  }

  // TODO: REMOVE
  logger.debug(`Context: Auth token: ${accessToken}`);

  const refreshToken = req?.cookies?.refreshToken ?? "";

  // TODO: REMOVE
  logger.debug(`Context: Refresh token: ${refreshToken}`);

  // TODO: Remove
  if (refreshToken) {
    // eslint-disable-next-line
    console.log(refreshToken, authAuthenticateUserByToken(refreshToken ?? ""));
  }

  if (refreshToken) {
    refreshTokenProvided = true;

    try {
      const apiUserInRefreshToken = authAuthenticateUserByToken(refreshToken);

      if (apiUserInRefreshToken) {
        validRefreshTokenProvided = true;

        if (!apiUser && !validAccessTokenProvided) {
          // seems like the request has no (valid) auth token
          // let us try to set at least the very basic reresh user from the refresh token
          apiUser = apiUserInRefreshToken;
          logger.info(
            "Auth token potentially invalid. But refresh token valid."
          );
        }
      } else {
        logger.warn("Refresh token invalid in context (1)");
      }
    } catch (Err) {
      logger.warn("Refresh token invalid in context (2)");
    }
  }

  if (accessTokenProvided || refreshTokenProvided)
    logger.debug(
      `Context: resolved ApiUser ID(${apiUser?.id}) AT: ${accessTokenProvided} RT: ${refreshTokenProvided}`
    );

  return {
    req,
    res,
    queryStartsWith,
    apiUser,
    tokenInfo: {
      accessTokenProvided,
      refreshTokenProvided,
      validAccessTokenProvided,
      validRefreshTokenProvided,
    },
  };
};

export default context;
