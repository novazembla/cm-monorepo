/// <reference path="../../types/nexus-typegen.ts" />

import dedent from "dedent";
import { Prisma, User as PrismaTypeUser } from "@prisma/client";

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
import { AppScopes, filteredOutputByWhitelist } from "@culturemap/core";

import {
  userRegister,
  userRead,
  userCreate,
  userUpdate,
  userDelete,
  userProfileUpdate,
  userProfilePasswordUpdate,
} from "../../services/serviceUser";
import {
  tokenProcessRefreshToken,
  tokenClearRefreshToken,
} from "../../services/serviceToken";
import { GQLJson } from "./nexusTypesShared";
import { ApiError } from "../../utils";
import {
  authorizeApiUser,
  isCurrentApiUser,
  isNotCurrentApiUser,
} from "../helpers";
import { apiConfig } from "../../config";
import {
  daoUserQuery,
  daoUserQueryCount,
  daoUserFindFirst,
  daoImageGetById,
  daoUserProfileImageDelete,
} from "../../dao";

const UserBaseNode = interfaceType({
  name: "UserBaseNode",
  resolveType: (data) =>
    typeof (data as any).role !== "undefined" ? "User" : "ProfileUser",
  definition(t) {
    t.nonNull.int("id");
    t.int("profileImageId");
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

export const AdminUser = objectType({
  name: "AdminUser",
  definition(t) {
    t.int("id");
    t.string("firstName");
    t.string("lastName");
  },
});

export const ProfileUser = objectType({
  name: "ProfileUser",
  definition(t) {
    t.implements(UserBaseNode);
    t.field("profileImage", {
      type: "Image",

      async resolve(...[parent]) {
        if (parent?.profileImageId)
          return daoImageGetById(parent.profileImageId);

        return null;
      },
    });
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

export const UserQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("users", {
      type: UsersQueryResult,
      args: {
        pageIndex: intArg({
          default: 0,
        }),
        pageSize: intArg({
          default: apiConfig.db.defaultPageSize,
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
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          users,
        };
      },
    });

    t.field("adminUsers", {
      type: list("AdminUser"),
      deprecation:
        "A publicly accessible list Lists all users that have a the given roles",

      args: {
        roles: nonNull(list(stringArg())),
      },

      // authorize: (...[, , ctx]) =>
      //   authorizeApiUser(ctx, "accessAsAuthenticatedUser"),

      async resolve(...[, args]) {
        const users = await daoUserQuery(
          {
            role: {
              in: (args.roles ?? []) as Prisma.Enumerable<string>,
            },
          },
          [{ firstName: "asc" }, { lastName: "asc" }],
          0,
          10000
        );

        return filteredOutputByWhitelist(users, [
          "id",
          "firstName",
          "lastName",
        ]);
      },
    });

    t.nonNull.field("userRead", {
      type: "User",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return userRead(args.id);
      },
    });

    t.nonNull.field("userProfileRead", {
      type: "ProfileUser",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
      },

      authorize: (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileRead") && isCurrentApiUser(ctx, args.id),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return userRead(args.id);
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

export const UserProfileUpdateInput = inputObjectType({
  name: "UserProfileUpdateInput",
  definition(t) {
    t.nonNull.string("firstName");
    t.nonNull.string("lastName");
    t.nonNull.email("email");
  },
});

export const UserCreateInput = inputObjectType({
  name: "UserCreateInput",
  definition(t) {
    t.nonNull.string("firstName");
    t.nonNull.string("lastName");
    t.nonNull.string("email");
    t.nonNull.string("password");
    t.nonNull.string("role");
    t.nonNull.boolean("userBanned");
    t.nonNull.boolean("acceptedTerms");
  },
});
export const UserUpdateInput = inputObjectType({
  name: "UserUpdateInput",
  definition(t) {
    t.nonNull.string("firstName");
    t.nonNull.string("lastName");
    t.nonNull.string("email");
    t.nonNull.string("role");
    t.nonNull.boolean("userBanned");
  },
});

export const UserMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("userSignup", {
      type: "AuthPayload",
      args: {
        scope: nonNull(stringArg()),
        data: nonNull(UserSignupInput),
      },

      authorize: () => apiConfig.enablePublicRegistration,

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

    t.nonNull.field("userProfileUpdate", {
      type: "User",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
        data: nonNull(UserProfileUpdateInput),
      },

      authorize: (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileUpdate") &&
        isCurrentApiUser(ctx, args.id),

      async resolve(...[, args]) {
        const user = await userProfileUpdate(
          args.scope as AppScopes,
          args.id,
          args.data
        );

        if (!user)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return user;
      },
    });

    t.nonNull.field("userProfilePasswordUpdate", {
      type: "User",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
        password: nonNull(stringArg()),
      },

      authorize: (...[, args, ctx]) =>
        authorizeApiUser(ctx, "profileUpdate") &&
        isCurrentApiUser(ctx, args.id),

      async resolve(...[, args, { res }]) {
        const user = await userProfilePasswordUpdate(
          args.scope as AppScopes,
          args.id,
          args.password
        );

        if (!user)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        tokenClearRefreshToken(res);

        return user;
      },
    });

    t.nonNull.field("userCreate", {
      type: "User",

      args: {
        scope: nonNull(stringArg()),
        data: nonNull(UserCreateInput),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userCreate"),

      async resolve(...[, args]) {
        const user = await userCreate(args.scope as AppScopes, args.data);

        if (!user)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return user;
      },
    });

    t.nonNull.field("userUpdate", {
      type: "BooleanResult",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
        data: nonNull(UserUpdateInput),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userUpdate"),

      async resolve(...[, args]) {
        const user = await userUpdate(
          args.scope as AppScopes,
          args.id,
          args.data
        );

        if (!user)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return { result: true };
      },
    });

    t.nonNull.field("userProfileImageDelete", {
      type: "BooleanResult",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
      },

      authorize: async (...[, args, ctx]) => {
        const user = await daoUserFindFirst({ profileImageId: args.id });

        if (user) {
          return (
            authorizeApiUser(ctx, "profileUpdate") &&
            isCurrentApiUser(ctx, user.id)
          );
        }

        return false;
      },

      async resolve(...[, args, ctx]) {
        const user = await daoUserProfileImageDelete(args.id, ctx?.apiUser?.id ?? 0);

        if (!user)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Profile image delete failed"
          );

        return { result: true };
      },
    });

    t.nonNull.field("userDelete", {
      type: "BooleanResult",

      args: {
        scope: nonNull(stringArg()),
        id: nonNull(intArg()),
      },

      authorize: (...[, args, ctx]) =>
        authorizeApiUser(ctx, "userDelete") &&
        isNotCurrentApiUser(ctx, args.id),

      async resolve(...[, args]) {
        const user = await userDelete(args.scope as AppScopes, args.id);

        if (!user)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "User delete failed"
          );

        return { result: true };
      },
    });
  },
});
