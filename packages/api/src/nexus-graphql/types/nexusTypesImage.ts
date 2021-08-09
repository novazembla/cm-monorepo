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
import { ApiError } from "../../utils";

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
} from "../../dao";

import { imageGetUploadInfo } from "../../services/serviceImage";

export const Image = objectType({
  name: "Image",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("ownerId");
    t.string("uuid");
    t.string("thumbUrl");
    t.string("status");
    t.json("meta");
    t.date("createdAt");
    t.date("updatedAt");
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
  },
});

export const ImageCreateInput = inputObjectType({
  name: "ImageCreateInput",
  definition(t) {
    t.nonNull.upload("image");
    t.nonNull.int("ownerId");
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
    t.nonNull.field("imageCreate", {
      type: "Image",

      args: {
        data: nonNull("ImageCreateInput"),
      },

      // TODO: enable later authorize: (...[, , ctx]) => authorizeApiUser(ctx, "imageCreate"),

      async resolve(...[, args]) {
        const uploadInfo = await imageGetUploadInfo();

        console.log(uploadInfo);
        // const { createReadStream, filename, mimetype, encoding } = await args
        //   ?.data?.image;

        // try {
        //   const { path, uuid } = imageGet
        // }
        // // Invoking the `createReadStream` will return a Readable Stream.
        // // See https://nodejs.org/api/stream.html#stream_readable_streams
        // const stream = createReadStream();

        // // This is purely for demonstration purposes and will overwrite the
        // // local-file-output.txt in the current working directory on EACH upload.
        // const out = require('fs').createWriteStream('local-file-output.txt');
        // stream.pipe(out);
        // await finished(out);

        // imageCreate(filename, mimetype, encoding, args.data.ownerId);

        // const image = await daoImageCreate({
        //   meta: args.meta,
        //   owner: {
        //     connect: { id: args.data.ownerId },
        //   },
        // });

        // if (!image)
        //   throw new ApiError(
        //     httpStatus.INTERNAL_SERVER_ERROR,
        //     "Creation failed"
        //   );

        return {
          id: 1,
          ownerId: 1,
          meta: {},
          status: "uploaded",
        };
      },
    });

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
