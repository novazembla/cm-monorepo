import { AuthenticationError } from "apollo-server-express";
import { daoUserQuery } from "../dao/user";
import { registerNewUser } from "../services/user";

import {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
} from "../services/auth";
import { processRefreshToken } from "../services/token";

const resolvers = {
  Query: {
    /* parent, args, context, info */
    users: (...args: any[]) => {
      const { query } = args[1];
      const where = {
        email: query.email,
      };
      return daoUserQuery(where, query.page, query.pageSize);
    },
  },
  Mutation: {
    userSignup: async (...args: any[]) => {
      const { data } = args[1];
      return registerNewUser(data);
    },
    userLogin: async (...args: any[]) => {
      const {
        data: { email, password },
      } = args[1];

      const { res } = args[2];

      const authPayload = await loginUserWithEmailAndPassword(email, password);

      if (!authPayload || !(authPayload as any)?.tokens?.access.token)
        throw new AuthenticationError("Access Denied");

      if (!authPayload || !(authPayload as any)?.tokens?.refresh.token)
        throw new AuthenticationError("Access Denied");

      return processRefreshToken(res, authPayload);
    },
    userLogout: async (...args: any[]) => {
      const {
        data: { userId },
      } = args[1];

      const { res } = args[2];

      res.cookie("refreshToken", "", {
        sameSite: "lax",
        httpOnly: true,
        expires: new Date("Thu, 01 Jan 1970 00:00:00 GMT"),
      });

      return logout(userId);
    },
    userRefresh: async (...args: any[]) => {
      const { res, req } = args[2];

      const token = req?.cookies?.refreshToken;

      if (!token) throw new AuthenticationError("Access Denied");

      const authPayload = await refreshAuth(token);

      if (!authPayload || !(authPayload as any)?.tokens?.refresh.token)
        throw new AuthenticationError("Access Denied");

      return processRefreshToken(res, authPayload);
    },
  },
};

export default resolvers;
