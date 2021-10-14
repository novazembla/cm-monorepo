/// <reference path="../../types/nexus-typegen.ts" />

import {
  objectType,
  asNexusMethod,
  inputObjectType,
  extendType,
  stringArg,
  intArg,
  arg,
  nonNull,
} from "nexus";
import { PermissionNames } from "@culturemap/core";
import {
  GraphQLDateTime,
  GraphQLJSON,
  GraphQLJWT,
  GraphQLEmailAddress,
} from "graphql-scalars";
import { authorizeApiUser } from "../helpers";
import { daoTermCheckSlugUnique, daoTaxonomyCheckSlugUnique } from "../../dao";

export const GQLDateTime = asNexusMethod(GraphQLDateTime, "date");
export const GQLJson = asNexusMethod(GraphQLJSON, "json");
export const GQLJwt = asNexusMethod(GraphQLJWT, "jwt");
export const GQLEmailAddress = asNexusMethod(GraphQLEmailAddress, "email");

export const BooleanResult = objectType({
  name: "BooleanResult",
  definition(t) {
    t.nonNull.boolean("result");
  },
});

export const GeoPoint = objectType({
  name: "GeoPoint",
  definition(t) {
    t.float("lat");
    t.float("lng");
  },
});

export const UniqueSlugResult = objectType({
  name: "UniqueSlugResult",
  definition(t) {
    t.nonNull.boolean("ok");
    t.json("errors");
  },
});

export const UniqueSlugInput = inputObjectType({
  name: "UniqueSlugInput",
  definition(t) {
    t.nonNull.json("slug");
  },
});

export const SharedQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("uniqueSlug", {
      type: UniqueSlugResult,

      args: {
        type: nonNull(stringArg()),
        id: nonNull(intArg()),
        data: nonNull(arg({ type: "UniqueSlugInput" })),
      },

      // TODO: enable
      authorize: (...[, args, ctx]) =>
        authorizeApiUser(ctx, `${args.type}Read` as PermissionNames),

      async resolve(...[, args]) {
        let errors;
        let ok = false;
        let result;

        switch (args.type) {
          case "taxonomy":
            result = await daoTaxonomyCheckSlugUnique(
              args?.data?.slug,
              true,
              args.id
            );
            break;

          case "term":
            result = await daoTermCheckSlugUnique(
              args?.data?.slug,
              true,
              args.id
            );
            break;

          default:
            break;
          // TODO:: add here tests for location, event, pages
        }

        if (result) {
          ok = result.ok;
          if (Object.keys(result.errors).length) {
            errors = result.errors;
          }
        }

        return {
          ok,
          errors,
        };
      },
    });
  },
});
