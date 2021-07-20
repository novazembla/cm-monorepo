import { Request, Response } from "express";
import { AuthenticationError } from "apollo-server-express";

import {
  AuthenticatedApiUser,
  authAuthenticateUserByToken,
} from "../services/auth";

export interface NexusResolverContext {
  req: Request;
  res: Response;
  apiUser: AuthenticatedApiUser | null;
  tokenProvided: boolean;
}

export const context = ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): NexusResolverContext => {
  let apiUser: AuthenticatedApiUser | null = null;
  let tokenProvided = false;
  let token = req?.headers?.authorization;

  if (token) {
    try {
      if (token.indexOf("Bearer") > -1)
        token = token.replace(/(Bearer:? )/g, "");

      tokenProvided = true;

      apiUser = authAuthenticateUserByToken(token);

      if (!apiUser)
        throw new AuthenticationError("Authentication rejected in context");
    } catch (Err) {
      throw new AuthenticationError("Authentication rejected in context");
    }
  }

  return { req, res, apiUser, tokenProvided };
};

export default context;
