/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";
import { PublishStatus } from "@culturemap/core";
import { Prisma } from "@prisma/client";

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
} from "nexus";
import httpStatus from "http-status";
import { ApiError } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser, apiUserCan } from "../helpers";

import { getApiConfig } from "../../config";

import {
  daoPageQuery,
  daoPageQueryCount,
  daoPageCreate,
  daoPageUpdate,
  daoPageDelete,
  daoPageQueryFirst,
  daoSharedGetTranslatedSelectColumns,
  daoSharedMapTranslatedColumnsInRowToJson,
} from "../../dao";

const apiConfig = getApiConfig();

export const Page = objectType({
  name: "Page",
  definition(t) {
    t.nonNull.int("id");

    t.json("title", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "title"),
    });

    t.json("slug", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "slug"),
    });
    t.json("intro", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "intro"),
    });

    t.json("content", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "content"),
    });

    t.json("metaDesc", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "metaDesc"),
    });

    t.string("fullText");
    t.nonNull.int("ownerId");
    t.nonNull.int("status");

    t.field("heroImage", {
      type: "Image",
    });
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const PageQueryResult = objectType({
  name: "PageQueryResult",
  description: dedent`
    List all the pages in the database.     
  `,
  definition: (t) => {
    t.int("totalCount");
    t.field("pages", {
      type: list("Page"),
    });
  },
});

export const PageQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("pages", {
      type: PageQueryResult,

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

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "pageReadOwn", true),

      async resolve(...[, args, ctx, info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let pages;

        let include: Prisma.PageInclude = {};
        let where: Prisma.PageWhereInput = args.where ?? {};

        if (!apiUserCan(ctx, "pageReadOwn")) {
          where = {
            ...where,
            status: PublishStatus.PUBLISHED,
          };
        } else {
          if (!apiUserCan(ctx, "canAccessTrash")) {
            where = {
              ...where,
              status: {
                not: { in: [PublishStatus.TRASHED, PublishStatus.DELETED] },
              },
            };
          }

          if (!apiUserCan(ctx, "pageRead")) {
            where = {
              ...where,
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            };
          }
        }

        if ((pRI?.fieldsByTypeName?.PageQueryResult as any)?.totalCount) {
          totalCount = await daoPageQueryCount(where);

          if (totalCount === 0)
            return {
              totalCount,
              pages: [],
            };
        }

        if (
          (pRI?.fieldsByTypeName?.PageQueryResult as any)?.pages
            ?.fieldsByTypeName?.Page?.heroImage
        ) {
          include = {
            ...include,
            heroImage: {
              select: {
                id: true,
                status: true,
                meta: true,
                cropPosition: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
            },
          };
        }

        if ((pRI?.fieldsByTypeName?.PageQueryResult as any)?.pages)
          pages = await daoPageQuery(
            where,
            Object.keys(include).length > 0 ? include : undefined,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          pages,
        };
      },
    });

    t.nonNull.field("page", {
      type: "Page",

      args: {
        slug: stringArg(),
        id: intArg(),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "pageReadOwn", true),

      // resolve(root, args, ctx, info)
      async resolve(...[, args, ctx, info]) {
        const config = getApiConfig();
        const pRI = parseResolveInfo(info);

        let where: Prisma.PageWhereInput[] = [];
        let include: Prisma.PageInclude = {};

        if (args.slug && args.slug.trim() !== "") {
          where.push({
            OR: config?.activeLanguages.map((lang) => ({
              [`slug_${lang}`]: args.slug,
            })),
          });
        }

        if (args.id) {
          where.push({
            id: args.id,
          });
        }

        if (!apiUserCan(ctx, "pageReadOwn")) {
          where.push({
            status: PublishStatus.PUBLISHED,
          });
        } else {
          if (!apiUserCan(ctx, "canAccessTrash")) {
            where.push({
              status: {
                not: { in: [PublishStatus.TRASHED, PublishStatus.DELETED] },
              },
            });
          }
          if (!apiUserCan(ctx, "pageRead")) {
            where.push({
              owner: {
                id: ctx?.apiUser?.id ?? 0,
              },
            });
          }
        }

        if ((pRI?.fieldsByTypeName?.Page as any)?.heroImage)
          include = {
            ...include,
            heroImage: {
              select: {
                id: true,
                status: true,
                meta: true,
                ...daoSharedGetTranslatedSelectColumns(["alt", "credits"]),
              },
            },
          };

        if (Object.keys(where).length > 0) {
          return daoPageQueryFirst(
            where.length > 1 ? { AND: where } : where.shift() ?? {},
            Object.keys(include).length > 0 ? include : undefined
          );
        } else {
          throw new ApiError(httpStatus.NOT_FOUND, "Not found");
        }
      },
    });
  },
});

export const PageCreateInput = inputObjectType({
  name: "PageUpsertInput",
  definition(t) {
    t.nonNull.json("title");
    t.nonNull.json("slug");
    t.json("heroImage");
    t.nonNull.json("intro");
    t.nonNull.json("content");
    t.json("metaDesc");
    t.nonNull.json("owner");
    t.nonNull.int("status");
  },
});

export const PageMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("pageCreate", {
      type: "Page",

      args: {
        data: nonNull("PageUpsertInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "pageCreate"),

      async resolve(...[, args]) {
        const page = await daoPageCreate(args.data);

        if (!page)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Creation failed"
          );

        return page;
      },
    });

    t.nonNull.field("pageUpdate", {
      type: "Page",

      args: {
        id: nonNull(intArg()),
        data: nonNull("PageUpsertInput"),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "pageUpdateOwn")) return false;

        if (apiUserCan(ctx, "pageUpdate")) return true;

        const count = await daoPageQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const page = await daoPageUpdate(args.id, args.data);

        if (!page)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return page;
      },
    });

    t.nonNull.field("pageDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      authorize: async (...[, args, ctx]) => {
        if (!authorizeApiUser(ctx, "pageDeleteOwn")) return false;

        if (apiUserCan(ctx, "pageUpdate")) return true;

        const count = await daoPageQueryCount({
          id: args.id,
          owner: {
            id: ctx.apiUser?.id ?? 0,
          },
        });

        return count === 1;
      },

      async resolve(...[, args]) {
        const page = await daoPageDelete(args.id);

        if (!page)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Delete failed");

        return { result: true };
      },
    });
  },
});
