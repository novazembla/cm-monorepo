/// <reference path="../../types/nexus-typegen.ts" />

import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  stringArg,
  intArg,
} from "nexus";
import httpStatus from "http-status";
import { AppScopes, filteredOutputByWhitelist } from "@culturemap/core";

import {
  userRegister,
  userRead,
  userProfileUpdate,
  userProfilePasswordUpdate,
} from "../../services/serviceUser";
import {
  tokenProcessRefreshToken,
  tokenClearRefreshToken,
} from "../../services/serviceToken";
import { ApiError } from "../../utils";
import { authorizeApiUser, isCurrentApiUser } from "../helpers";

// TODO this white listing of keys is rather annoying,
const FIELD_KEYS_USER_PROFILE = [
  "id",
  "email",
  "firstName",
  "lastName",
  "role",
  "emailVerified",
];

const FIELD_KEYS_USER = [
  ...FIELD_KEYS_USER_PROFILE,
  ...["userBanned", "createdAt", "updatedAt"],
];

export const User = objectType({
  name: "User",
  definition(t) {
    t.nonNull.int("id");
    t.string("firstName");
    t.string("lastName");
    t.email("email");
    t.string("role");
    t.boolean("emailVerified");
    t.boolean("userBanned");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const ProfileUser = objectType({
  name: "ProfileUser",
  definition(t) {
    t.nonNull.int("id");
    t.string("firstName");
    t.string("lastName");
    t.email("email");
    t.string("role");
    t.boolean("emailVerified");
  },
});

export const UserQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("users", {
      type: "User",

      authorize: async (...[, , ctx]) => authorizeApiUser(ctx, "userRead"),

      // resolve(root, args, ctx, info)
      resolve(...[, , ctx]) {
        return filteredOutputByWhitelist(
          [
            {
              id: 1,
              firstName: `Vincent (${ctx.apiUser?.id}) ${new Date()}`,
              lastName: "Van Uffelen",
              email: "test@test.com",
            },
          ],
          FIELD_KEYS_USER
        );
      },
    });
  },
});

// TODO: remove!
export const User2Query = extendType({
  type: "Query",
  definition(t) {
    t.list.field("users2", {
      type: "User",

      // resolve(root, args, ctx, info)
      resolve(...[, , ctx]) {
        return filteredOutputByWhitelist(
          [
            {
              id: 1,
              firstName: `Vincent (${ctx.apiUser?.id}) ${new Date()}`,
              lastName: "Van Uffelen",
              email: "test@test.com",
            },
          ],
          FIELD_KEYS_USER
        );
      },
    });
  },
});

export const UserProfileQuery = extendType({
  type: "Query",
  definition(t) {
    t.nonNull.field("userProfileRead", {
      type: "ProfileUser",

      args: {
        scope: nonNull(stringArg()),
        userId: nonNull(intArg()),
      },

      authorize: async (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileRead") &&
        isCurrentApiUser(ctx, args.userId),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        const user = await userRead(args.userId);

        // it's a bit annoying that we can't just dump the dao returs.
        // TODO: more comfortable work arround
        return filteredOutputByWhitelist(user, FIELD_KEYS_USER_PROFILE);
      },
    });
  },
});

export const UserSignupInput = inputObjectType({
  name: "UserSignupInput",
  definition(t) {
    t.nonNull.string("firstName");
    t.nonNull.string("lastName");
    t.nonNull.email("email");
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
        scope: nonNull(stringArg()),
        data: nonNull(UserSignupInput),
      },
      async resolve(...[, args, { res }]) {
        const authPayload = await userRegister(
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

export const UserProfileUpdateInput = inputObjectType({
  name: "UserProfileUpdateInput",
  definition(t) {
    t.nonNull.string("firstName");
    t.nonNull.string("lastName");
    t.nonNull.email("email");
  },
});

export const UserProfileUpdateMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userProfileUpdate", {
      type: "User",

      args: {
        scope: nonNull(stringArg()),
        userId: nonNull(intArg()),
        data: nonNull(UserProfileUpdateInput),
      },

      authorize: async (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileUpdate") &&
        isCurrentApiUser(ctx, args.userId),

      async resolve(...[, args]) {
        const user = await userProfileUpdate(
          args.scope as AppScopes,
          args.userId,
          args.data
        );

        if (!user)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return filteredOutputByWhitelist(user, FIELD_KEYS_USER_PROFILE);
      },
    });
  },
});

export const UserProfilePasswordUpdateMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userProfilePasswordUpdate", {
      type: "User",

      args: {
        scope: nonNull(stringArg()),
        userId: nonNull(intArg()),
        password: nonNull(stringArg()),
      },

      authorize: async (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileUpdate") &&
        isCurrentApiUser(ctx, args.userId),

      async resolve(...[, args, { res }]) {
        const user = await userProfilePasswordUpdate(
          args.scope as AppScopes,
          args.userId,
          args.password
        );

        if (!user)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        tokenClearRefreshToken(res);

        return filteredOutputByWhitelist(user, FIELD_KEYS_USER_PROFILE);
      },
    });
  },
});

export default User;
