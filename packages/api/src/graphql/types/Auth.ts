import { objectType, extendType, nonNull, inputObjectType } from "nexus";
import httpStatus from "http-status";
import { loginUserWithEmailAndPassword } from "../../services/auth";
import { processRefreshToken } from "../../services/token";

import { ApiError } from "../../utils/ApiError";

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
    t.nonNull.field("login", {
      type: "AuthPayload",
      args: {
        data: nonNull(UserLoginInput),
      },
      async resolve(...[, { data }, { res }]) {
        const authPayload = await loginUserWithEmailAndPassword(
          (data as any).email,
          (data as any).password
        );

        if (!authPayload)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Login Failed");

        return processRefreshToken(res, authPayload);
      },
    });
  },
});

export default AuthPayload;
