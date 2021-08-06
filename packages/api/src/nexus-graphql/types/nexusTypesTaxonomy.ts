/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";

import dedent from "dedent";
import {
  objectType,
  extendType,
  // inputObjectType,
  nonNull,
  // stringArg,
  intArg,
  arg,
  list,
} from "nexus";
// import httpStatus from "http-status";
// import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

// import {
//   authorizeApiUser,
//   isCurrentApiUser,
//   isNotCurrentApiUser,
// } from "../helpers";

import config from "../../config";

import {
  daoTaxonomyQuery,
  daoTaxonomyQueryCount,
  daoTaxonomyGetById,
  daoTaxonomyGetTerms,
} from "../../dao/taxonomy";

export const Taxonomy = objectType({
  name: "Taxonomy",
  definition(t) {
    t.nonNull.int("id");
    t.json("name");
    t.json("slug");
    t.date("createdAt");
    t.date("updatedAt");
    t.field("terms", {
      type: list("Term"),

      // TODO: add access restrictions
      async resolve(...[p]) {
        return daoTaxonomyGetTerms(p.id);
      },
    });
  },
});

export const TaxonomyQueryResult = objectType({
  name: "TaxonomyQueryResult",
  description: dedent`
    List all the taxonomies in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("taxonomies", {
      type: list(Taxonomy),
    });
  },
});

export const TaxonomyQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("taxonomies", {
      type: TaxonomyQueryResult,

      args: {
        pageIndex: intArg({
          default: 0,
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

      // TODO: enable authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userRead"),
      // {
      //   [A:API] [NODE]   name: 'taxonomies',
      //   [A:API] [NODE]   alias: 'taxonomies',
      //   [A:API] [NODE]   args: { pageIndex: 0, pageSize: 50 },
      //   [A:API] [NODE]   fieldsByTypeName: {
      //   [A:API] [NODE]     TaxonomyQueryResult: { totalCount: [Object], taxonomies: [Object] }
      //   [A:API] [NODE]

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let taxonomies;

        if ((pRI?.fieldsByTypeName?.TaxonomyQueryResult as any)?.totalCount) {
          totalCount = await daoTaxonomyQueryCount(args.where);

          if (totalCount === 0)
            return {
              totalCount,
              taxonomies: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.TaxonomyQueryResult as any)?.taxonomies)
          taxonomies = await daoTaxonomyQuery(
            args.where,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          taxonomies,
        };
      },
    });

    t.nonNull.field("taxonomyRead", {
      type: "Taxonomy",

      args: {
        id: nonNull(intArg()),
      },

      // TODO: lock down authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoTaxonomyGetById(args.id);
      },
    });
  },
});

// export const UserSignupInput = inputObjectType({
//   name: "UserSignupInput",
//   definition(t) {
//     t.nonNull.string("firstName");
//     t.nonNull.string("lastName");
//     t.nonNull.email("email");
//     t.nonNull.string("password");
//     t.nonNull.boolean("acceptedTerms");
//   },
// });

// export const UserProfileUpdateInput = inputObjectType({
//   name: "UserProfileUpdateInput",
//   definition(t) {
//     t.nonNull.string("firstName");
//     t.nonNull.string("lastName");
//     t.nonNull.email("email");
//   },
// });

// export const UserInsertInput = inputObjectType({
//   name: "UserInsertInput",
//   definition(t) {
//     t.nonNull.string("firstName");
//     t.nonNull.string("lastName");
//     t.nonNull.string("email");
//     t.nonNull.string("password");
//     t.nonNull.string("role");
//     t.nonNull.boolean("userBanned");
//     t.nonNull.boolean("acceptedTerms");
//   },
// });
// export const UserUpdateInput = inputObjectType({
//   name: "UserUpdateInput",
//   definition(t) {
//     t.nonNull.string("firstName");
//     t.nonNull.string("lastName");
//     t.nonNull.string("email");
//     t.nonNull.string("role");
//     t.nonNull.boolean("userBanned");
//   },
// });

// export const UserMutations = extendType({
//   type: "Mutation",

//   definition(t) {
//     t.nonNull.field("userSignup", {
//       type: "AuthPayload",
//       args: {
//         scope: nonNull(stringArg()),
//         data: nonNull(UserSignupInput),
//       },
//       async resolve(...[, args, { res }]) {
//         const authPayload = await userRegister(
//           args.scope as AppScopes,
//           args.data
//         );

//         if (!authPayload)
//           throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Signup Failed");

//         return tokenProcessRefreshToken(res, authPayload);
//       },
//     });

//     t.nonNull.field("userProfileUpdate", {
//       type: "User",

//       args: {
//         scope: nonNull(stringArg()),
//         id: nonNull(intArg()),
//         data: nonNull(UserProfileUpdateInput),
//       },

//       authorize: (...[, args, ctx]) =>
//         authorizeApiUser(ctx, "profileUpdate") &&
//         isCurrentApiUser(ctx, args.id),

//       async resolve(...[, args]) {
//         const user = await userProfileUpdate(
//           args.scope as AppScopes,
//           args.id,
//           args.data
//         );

//         if (!user)
//           throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

//         return user;
//       },
//     });

//     t.nonNull.field("userProfilePasswordUpdate", {
//       type: "User",

//       args: {
//         scope: nonNull(stringArg()),
//         id: nonNull(intArg()),
//         password: nonNull(stringArg()),
//       },

//       authorize: (...[, args, ctx]) =>
//         authorizeApiUser(ctx, "profileUpdate") &&
//         isCurrentApiUser(ctx, args.id),

//       async resolve(...[, args, { res }]) {
//         const user = await userProfilePasswordUpdate(
//           args.scope as AppScopes,
//           args.id,
//           args.password
//         );

//         if (!user)
//           throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

//         tokenClearRefreshToken(res);

//         return user;
//       },
//     });

//     t.nonNull.field("userCreate", {
//       type: "User",

//       args: {
//         scope: nonNull(stringArg()),
//         data: nonNull(UserInsertInput),
//       },

//       authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userCreate"),

//       async resolve(...[, args]) {
//         const user = await userCreate(args.scope as AppScopes, args.data);

//         if (!user)
//           throw new ApiError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             "Creation failed"
//           );

//         return user;
//       },
//     });

//     t.nonNull.field("userUpdate", {
//       type: "BooleanResult",

//       args: {
//         scope: nonNull(stringArg()),
//         id: nonNull(intArg()),
//         data: nonNull(UserUpdateInput),
//       },

//       authorize: (...[, , ctx]) => authorizeApiUser(ctx, "userUpdate"),

//       async resolve(...[, args]) {
//         const user = await userUpdate(
//           args.scope as AppScopes,
//           args.id,
//           args.data
//         );

//         if (!user)
//           throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

//         return { result: true };
//       },
//     });

//     t.nonNull.field("userDelete", {
//       type: "BooleanResult",

//       args: {
//         scope: nonNull(stringArg()),
//         id: nonNull(intArg()),
//       },

//       authorize: (...[, args, ctx]) =>
//         authorizeApiUser(ctx, "userDelete") &&
//         isNotCurrentApiUser(ctx, args.id),

//       async resolve(...[, args]) {
//         const user = await userDelete(args.scope as AppScopes, args.id);

//         if (!user)
//           throw new ApiError(
//             httpStatus.INTERNAL_SERVER_ERROR,
//             "User delete failed"
//           );

//         return { result: true };
//       },
//     });
//   },
// });

// export default User;
