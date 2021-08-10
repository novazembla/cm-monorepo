/// <reference path="../../types/nexus-typegen.ts" />
import { parseResolveInfo } from "graphql-parse-resolve-info";

import dedent from "dedent";
import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  // stringArg,
  intArg,
  arg,
  list,
} from "nexus";
import httpStatus from "http-status";
import { ApiError, ImageStatusEnum } from "../../utils";

import { GQLJson } from "./nexusTypesShared";

import { authorizeApiUser } from "../helpers";

import config from "../../config";

import {
  daoImageQuery,
  // daoImageCreate,
  daoImageUpdate,
  daoImageDelete,
  daoImageQueryCount,
  daoImageGetById,
  daoImageGetStatusById,
  ImageMetaInformation,
} from "../../dao";

export const Image = objectType({
  name: "Image",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("ownerId");
    t.string("uuid");
    t.int("status");
    t.json("meta");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const ImageStatus = objectType({
  name: "ImageStatus",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.string("status");
    t.json("sizes");
  },
});

export const ImageQueryResult = objectType({
  name: "ImageQueryResult",

  description: dedent`
    List all the available images in the database.     
  `,

  definition: (t) => {
    t.int("totalCount");
    t.field("images", { type: list("Image") });
  },
});

export const ImageQueries = extendType({
  type: "Query",
  definition(t) {
    t.field("images", {
      type: "ImageQueryResult",

      args: {
        taxonomyId: nonNull(intArg()),
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

      async resolve(...[, args, , info]) {
        const pRI = parseResolveInfo(info);

        let totalCount;
        let images;

        if ((pRI?.fieldsByTypeName?.ImageQueryResult as any)?.totalCount) {
          totalCount = await daoImageQueryCount(args.where);

          if (totalCount === 0)
            return {
              totalCount,
              images: [],
            };
        }

        if ((pRI?.fieldsByTypeName?.ImageQueryResult as any)?.images)
          images = await daoImageQuery(
            args.where,
            args.orderBy,
            args.pageIndex as number,
            args.pageSize as number
          );

        return {
          totalCount,
          images,
        };
      },
    });

    t.nonNull.field("imageRead", {
      type: "Image",

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "imageRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        return daoImageGetById(args.id);
      },
    });

    t.nonNull.field("imageStatus", {
      type: "ImageStatus",

      args: {
        id: nonNull(intArg()),
      },

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        const image: any = await daoImageGetStatusById(args.id);

        let status;
        switch (image.status) {
          case ImageStatusEnum.UPLOADED:
            status = "uploaded";
            break;

          case ImageStatusEnum.PROCESSING:
            status = "processing";
            break;

          case ImageStatusEnum.ERROR:
            status = "error";
            break;

          case ImageStatusEnum.READY:
            status = "ready";
            break;

          default:
            status = "unknown";
        }
        return {
          id: image.id,
          status,
          sizes: (image.meta as ImageMetaInformation).availableSizes,
        };
      },
    });
  },
});

export const ImageUpdateInput = inputObjectType({
  name: "ImageUpdateInput",
  definition(t) {
    t.nonNull.json("meta");
    t.nonNull.int("ownerId");
  },
});

export const ImageMutations = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("imageUpdate", {
      type: "Image",

      args: {
        id: nonNull(intArg()),
        data: nonNull("ImageUpdateInput"),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "imageUpdate"),

      async resolve(...[, args]) {
        const image = await daoImageUpdate(args.id, args.data);

        if (!image)
          throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, "Update failed");

        return image;
      },
    });

    t.nonNull.field("imageDelete", {
      type: "BooleanResult",

      args: {
        id: nonNull(intArg()),
      },

      // TODO enable later also check if user owns if not full access ... authorize: (...[, , ctx]) => authorizeApiUser(ctx, "imageDelete"),

      async resolve(...[, args]) {
        const image = await daoImageDelete(args.id);

        if (!image)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Image deletion failed"
          );

        return { result: true };
      },
    });
  },
});