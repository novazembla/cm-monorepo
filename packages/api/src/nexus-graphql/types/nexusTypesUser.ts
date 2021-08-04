/// <reference path="../../types/nexus-typegen.ts" />

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  stringArg,
  intArg,
  arg,
  list,
  interfaceType,
} from "nexus";
import httpStatus from "http-status";
import { AppScopes } from "@culturemap/core";

import { User as PrismaTypeUser } from "@prisma/client";

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
import { GQLJson } from "./nexusTypesShared";
import { ApiError } from "../../utils";
import { authorizeApiUser, isCurrentApiUser } from "../helpers";
import config from "../../config";
import { daoUserQuery, daoUserQueryCount } from "../../dao";

const UserBaseNode = interfaceType({
  name: "UserBaseNode",
  resolveType: (data) =>
    typeof (data as any).role !== "undefined" ? "User" : "ProfileUser",
  definition(t) {
    t.nonNull.int("id");
    t.string("firstName");
    t.string("lastName");
    t.email("email");
    t.boolean("emailVerified");
  },
});

export const User = objectType({
  name: "User",
  definition(t) {
    t.implements(UserBaseNode);
    t.string("role");
    t.boolean("userBanned");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const ProfileUser = objectType({
  name: "ProfileUser",
  definition(t) {
    t.implements(UserBaseNode);
  },
});

export const UsersQueryResult = objectType({
  name: "UsersQueryResult",
  description: dedent`
    TODO: write better descriptions
    last item in the list. Pass this cuSimple wrapper around our list of launches that contains a cursor to the
    last item in the list. Pass this cursor to the launches query to fetch results
    after these.
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("users", { type: list(User) });
  },
});

export const Query = objectType({
  name: "Query",
  definition(t) {
    // t.field('launches', {})
    // https://clearbit.com/
    t.field("users", {
      type: UsersQueryResult,
      args: {
        page: intArg({
          default: 1,
        }),
        pageSize: intArg({
          default: config.db.defaultPageSize,
        }),
        orderBy: arg({
          type: GQLJson,
          default: undefined,
        }),
        where: arg({
          type: GQLJson,
          default: undefined,
        }),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userRead"),

      async resolve(...[, args]) {
        const totalCount = await daoUserQueryCount(args.where);
        let users: PrismaTypeUser[] = [];

        if (totalCount)
          users = await daoUserQuery(
            args.where,
            args.orderBy,
            args.page as number,
            args.pageSize as number
          );

        return {
          totalCount,
          users,
        };
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

      authorize: (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileRead") &&
        isCurrentApiUser(ctx, args.userId),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return userRead(args.userId);
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

      authorize: (...[, args, ctx]) =>
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

        return user;
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

      authorize: (...[, args, ctx]) =>
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

        return user;
      },
    });
  },
});

export default User;
