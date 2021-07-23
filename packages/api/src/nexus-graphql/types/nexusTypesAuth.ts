import { objectType, extendType, nonNull, intArg, stringArg } from "nexus";
import { AuthenticationError } from "apollo-server-express";
import { AppScopes } from "@culturemap/core";

import {
  authLoginUserWithEmailAndPassword,
  authLogout,
  authRefresh,
  authRequestPasswordReset,
  authResetPassword,
  authConfirmEmail,
  authConfirmationEmailRequest,
} from "../../services/serviceAuth";
import {
  tokenProcessRefreshToken,
  tokenClearRefreshToken,
} from "../../services/serviceToken";
import { authorizeApiUser } from "../helpers";
import { BooleanResult } from "./nexusTypesShared";

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

export const AuthLoginMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authLogin", {
      type: "AuthPayload",
      args: {
        email: nonNull(stringArg()),
        password: nonNull(stringArg()),
      },
      async resolve(...[, args, { res }]) {
        try {
          const authPayload = await authLoginUserWithEmailAndPassword(
            args.email,
            args.password
          );
          return tokenProcessRefreshToken(res, authPayload);
        } catch (Err) {
          throw new AuthenticationError("Login Failed");
        }
      },
    });
  },
});

export const AuthRefreshMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authRefresh", {
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

export const AuthLogoutMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authLogout", {
      type: BooleanResult,
      args: {
        userId: nonNull(intArg()),
      },

      async resolve(...[, args, { res, apiUser }]) {
        // in any case we want to remove the refresh token for the submitting user
        tokenClearRefreshToken(res);

        // then test if the submitting user is the user to be logged out
        if (!apiUser || apiUser.id !== args.userId)
          throw new AuthenticationError("Logout Failed (1)");

        // okay then log the user out
        const result = await authLogout(args.userId);

        if (!result) throw new AuthenticationError("Logout Failed (2)");

        return { result };
      },
    });
  },
});

export const AuthPasswordRequestMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authPasswordRequest", {
      type: BooleanResult,
      args: {
        scope: nonNull(stringArg()),
        email: nonNull(stringArg()),
      },

      async resolve(...[, args]) {
        const result = await authRequestPasswordReset(
          args.scope as AppScopes,
          args.email
        );

        return { result };
      },
    });
  },
});

export const AuthPasswordResetMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authPasswordReset", {
      type: BooleanResult,
      args: {
        password: nonNull(stringArg()),
        token: nonNull(stringArg()),
      },

      async resolve(...[, args]) {
        const result = await authResetPassword(args.password, args.token);

        return { result };
      },
    });
  },
});

export const AuthConfirmEmailMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authConfirmEmail", {
      type: BooleanResult,
      args: {
        token: nonNull(stringArg()),
      },

      async resolve(...[, args]) {
        const result = await authConfirmEmail(args.token);

        return { result };
      },
    });
  },
});

export const AuthConfirmationEmailRequestMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("authConfirmationEmailRequest", {
      type: BooleanResult,
      args: {
        scope: nonNull(stringArg()),
        userId: nonNull(intArg()),
      },

      authorize: async (...[, , ctx]) =>
        authorizeApiUser(ctx, "canConfirmToken"),

      async resolve(...[, args]) {
        const result = await authConfirmationEmailRequest(
          args.scope as AppScopes,
          args.userId
        );

        return { result };
      },
    });
  },
});
