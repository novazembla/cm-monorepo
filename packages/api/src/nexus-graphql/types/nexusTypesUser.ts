// import { objectType, extendType, stringArg, nonNull } from "nexus";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  stringArg,
} from "nexus";
import httpStatus from "http-status";
import { AppScopes } from "@culturemap/core";

import { registerNewUser } from "../../services/serviceUser";
import { tokenProcessRefreshToken } from "../../services/serviceToken";
import { ApiError } from "../../utils";
import { authorizeApiUser } from "../helpers";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("firstName");
    t.string("lastName");
    t.string("email");
  },
});

// const userQueryAuthentication: fieldAuthorizePluginCore.FieldAuthorizeResolver<
//   "Query",
//   "users"
// > = async (...[, , ctx]) => !!(ctx.apiUser && ctx.apiUser.can("userRead"));

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("users", {
      type: "User",

      authorize: async (...[, , ctx]) => authorizeApiUser(ctx, "userRead"),

      // resolve(root, args, ctx, info)
      resolve(...[, , ctx]) {
        return [
          {
            id: 1,
            firstName: `Vincent (${ctx.apiUser?.id})`,
            lastName: "Van Uffelen",
            email: "test@test.com",
          },
        ];
      },
    });
  },
});

// TODO: remove!
export const User2Query = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("users2", {
      type: "User",

      // resolve(root, args, ctx, info)
      resolve(...[, , ctx]) {
        return [
          {
            id: 1,
            firstName: `Vincent (${ctx.apiUser?.id})`,
            lastName: "Van Uffelen",
            email: "test@test.com",
          },
        ];
      },
    });
  },
});

export const UserSignupInput = inputObjectType({
  name: "UserSignupInput",
  definition(t) {
    t.nonNull.string("firstName");
    t.nonNull.string("lastName");
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.nonNull.boolean("acceptedTerms");
  },
});

export const UserSignupMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userSignup", {
      type: "AuthPayload",
      args: {
        data: nonNull(UserSignupInput),
        scope: nonNull(stringArg()),
      },
      async resolve(...[, args, { res }]) {
        const authPayload = await registerNewUser(
          args.scope as AppScopes,
          args.data
        );

        if (!authPayload)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Signup Failed");

        return tokenProcessRefreshToken(res, authPayload);
      },
    });
  },
});

export default User;
