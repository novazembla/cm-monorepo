import { Request, Response } from "express";

import { logger } from "../services/serviceLogging";

import {
  AuthenticatedApiUser,
  authAuthenticateUserByToken,
} from "../services/serviceAuth";

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

  let token = req?.headers?.authorization;
  if (token) {
    accessTokenProvided = true;

    try {
      if (token.indexOf("Bearer") > -1)
        token = token.replace(/(Bearer:? )/g, "");

      apiUser = authAuthenticateUserByToken(token);

      if (apiUser) {
        validAccessTokenProvided = true;
      } else {
        logger.warn("Authentication token invalid in context (1)");
      }
    } catch (Err) {
      logger.warn("Authentication token invalid in context (2)");
    }
  }

  token = req?.cookies?.refreshToken;
  if (token) {
    refreshTokenProvided = true;

    try {
      const apiUserInRefreshToken = authAuthenticateUserByToken(token);

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

  logger.debug(`ApiUser ID(${apiUser?.id})`);

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
