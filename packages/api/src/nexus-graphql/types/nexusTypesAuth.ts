import { objectType, extendType, nonNull, inputObjectType } from "nexus";
import { AuthenticationError } from "apollo-server-express";
import {
  authLoginUserWithEmailAndPassword,
  authLogout,
  authRefresh,
} from "../../services/serviceAuth";
import {
  tokenProcessRefreshToken,
  tokenClearRefreshToken,
} from "../../services/serviceToken";
import { authorizeApiUser } from "../helpers";

export const AuthUser = objectType({
  name: "AuthUser",
  definition(t) {
    t.nonNull.int("id", { description: "Id of the user" });
    t.list.string("roles", { description: "The roles the user might hold" });
    t.list.string("permissions", {
      description: "The permissions the user might have been given",
    });
  },
});

export const AuthPayloadToken = objectType({
  name: "AuthPayloadToken",
  definition(t) {
    t.string("token");
    t.nonNull.string("expires");
  },
});

export const AuthPayloadTokens = objectType({
  name: "AuthPayloadTokens",
  definition(t) {
    t.field("access", {
      type: AuthPayloadToken,
    });
    t.field("refresh", {
      type: AuthPayloadToken,
    });
  },
});

export const AuthPayload = objectType({
  name: "AuthPayload",
  definition(t) {
    t.field("user", {
      type: AuthUser,
    });
    t.field("tokens", {
      type: AuthPayloadTokens,
    });
  },
});

export const UserLoginInput = inputObjectType({
  name: "UserLoginInput",
  definition(t) {
    t.nonNull.string("email");
    t.nonNull.string("password");
  },
});

export const UserLoginMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userLogin", {
      type: "AuthPayload",
      args: {
        data: nonNull(UserLoginInput),
      },
      async resolve(...[, args, { res }]) {
        const authPayload = await authLoginUserWithEmailAndPassword(
          args.data.email,
          args.data.password
        );

        if (!authPayload) throw new AuthenticationError("Login Failed");

        return tokenProcessRefreshToken(res, authPayload);
      },
    });
  },
});

export const UserRefreshMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userRefresh", {
      type: "AuthPayload",

      authorize: async (...[, , ctx]) =>
        authorizeApiUser(ctx, "canRefreshAccessToken", true),

      async resolve(...[, , { res, req }]) {
        // throw new AuthenticationError("Access Denied"); TODO: REmove

        const token = req?.cookies?.refreshToken;

        if (!token) throw new AuthenticationError("Access Denied");

        const authPayload = await authRefresh(token);

        if (!authPayload || !authPayload?.tokens?.refresh?.token)
          throw new AuthenticationError("Access Denied");

        return tokenProcessRefreshToken(res, authPayload);
      },
    });
  },
});

export const UserLogoutInput = inputObjectType({
  name: "UserLogoutInput",
  definition(t) {
    t.nonNull.int("userId");
  },
});

export const UserLogoutResult = objectType({
  name: "UserLogoutResult",
  definition(t) {
    t.nonNull.boolean("result");
  },
});

export const UserLogoutMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userLogout", {
      type: UserLogoutResult,
      args: {
        data: nonNull(UserLogoutInput),
      },

      async resolve(...[, args, { res, apiUser }]) {
        // in any case we want to remove the refresh token for the submitting user
        tokenClearRefreshToken(res);

        // then test if the submitting user is the user to be logged out
        if (!apiUser || apiUser.id !== args.data.userId)
          throw new AuthenticationError("Logout Failed (1)");

        // okay then log the user out
        const result = await authLogout(args.data.userId);

        if (!result) throw new AuthenticationError("Logout Failed (2)");

        return { result };
      },
    });
  },
});

export default AuthPayload;
