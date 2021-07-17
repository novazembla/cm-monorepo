import { Request, Response } from "express";
import { AuthenticationError } from "apollo-server-express";

import {
  AuthenticatedApiUser,
  authenticateUserByToken,
} from "../services/auth";

export interface NexusResolverContext {
  req: Request;
  res: Response;
  apiUser: AuthenticatedApiUser | null;
}

export const context = ({
  req,
  res,
}: {
  req: Request;
  res: Response;
}): NexusResolverContext => {
  let apiUser: AuthenticatedApiUser | null = null;

  let token = req?.headers?.authorization;

  if (token) {
    try {
      if (token.indexOf("Bearer") > -1)
        token = token.replace(/(Bearer:? )/g, "");
        
      apiUser = authenticateUserByToken(token);
      if (!apiUser) {
        throw new AuthenticationError("Access denied (T1)");
      }
    } catch (Err) {
      console.log(Err);
      throw new AuthenticationError("Access denied (T2)");
    }
  }

  return { req, res, apiUser };
};

export default context;
