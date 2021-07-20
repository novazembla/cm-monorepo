import { objectType, extendType, nonNull, inputObjectType } from "nexus";
import { AuthenticationError } from "apollo-server-express";
import {
  authLoginUserWithEmailAndPassword,
  authLogout,
  authRefresh,
} from "../../services/auth";
import {
  tokenProcessRefreshToken,
  tokenClearRefreshToken,
} from "../../services/token";

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
      async resolve(...[, , { res, req }]) {
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

      authorize: async (...[, , ctx]) =>
        !!(ctx.apiUser && ctx.apiUser.can("accessAsAuthenticatedUser")),

      async resolve(...[, args, { res }]) {
        const result = await authLogout(args.data.userId);

        if (!result) throw new AuthenticationError("Logout Failed");

        tokenClearRefreshToken(res);
        return { result };
      },
    });
  },
});

export default AuthPayload;
