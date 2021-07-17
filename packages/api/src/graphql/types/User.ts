// import { objectType, extendType, stringArg, nonNull } from "nexus";
import { objectType, extendType, inputObjectType, nonNull } from "nexus";
import httpStatus from "http-status";

import { registerNewUser } from "../../services/user";
import { processRefreshToken } from "../../services/token";
import { ApiError } from "../../utils";

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("firstName");
    t.string("lastName");
    t.string("email");
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.list.field("users", {
      type: "User",
      // TODO: permissions: ["userRead"],
      // TODO: authorize: (...[, , ctx]) => ctx.apiUser.can(ctx.apiUser),
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
      },
      async resolve(...[, { data }, { res }]) {
        const authPayload = await registerNewUser(data);

        if (!authPayload)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Signup Failed");

        return processRefreshToken(res, authPayload);
      },
    });
  },
});

export default User;
