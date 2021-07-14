import { AuthenticationError } from "apollo-server-express";
import { queryUsers } from "../dao/user";
import { registerNewUser } from "../services/user";
import {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
} from "../services/auth";

const resolvers = {
  Query: {
    /* parent, args, context, info */
    users: (...args) => queryUsers(args[1]),
  },
  Mutation: {
    userSignup: async (...args) => {
      const { data } = args[1];
      return registerNewUser(data);
    },
    userLogin: async (...args) => {
      const {
        data: { email, password },
      } = args[1];

      const { res } = args[2];

      const authPayload = await loginUserWithEmailAndPassword(email, password);

      res.cookie("refreshToken", authPayload.tokens.refresh.token, {
        sameSite: "lax",
        httpOnly: true,
        maxAge:
          new Date(authPayload.tokens.refresh.expires).getTime() -
          new Date().getTime(),
      });

      authPayload.tokens.refresh.token = "content is hidden";

      return authPayload;
    },
    userLogout: async (...args) => {
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
    userRefresh: async (...args) => {
      const { res, req } = args[2];

      const token = req?.cookies?.refreshToken;

      if (!token) throw new AuthenticationError("Access Denied");

      const authPayload = await refreshAuth(token);

      if (!authPayload) throw new AuthenticationError("Access Denied");

      res.cookie("refreshToken", authPayload.tokens.refresh.token, {
        sameSite: "lax",
        httpOnly: true,
        maxAge:
          new Date(authPayload.tokens.refresh.expires).getTime() -
          new Date().getTime(),
      });

      authPayload.tokens.refresh.token = "content is hidden";

      return authPayload;
    },
  },
};

export default resolvers;
