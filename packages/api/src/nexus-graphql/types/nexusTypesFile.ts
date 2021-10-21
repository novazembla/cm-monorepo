/// <reference path="../../types/nexus-typegen.ts" />
import { objectType } from "nexus";

import { daoSharedMapTranslatedColumnsInRowToJson } from "../../dao";

export const File = objectType({
  name: "File",
  definition(t) {
    t.nonNull.int("id");
    t.nonNull.int("ownerId");
    t.string("nanoid");
    t.int("status");

    t.json("meta", {
      // we want to prune the meta data from some values that are maybe giving somethis away (like server paths)
      // so only expose save attributes
      resolve: (...[p]) => {
        const meta = (p as any)?.meta;

        if (meta && meta?.originalFileUrl) {
          return {
            originalFileUrl: meta?.originalFileUrl,
            originalFileName: meta?.originalFileName,
            mimeType: meta?.mimeType,
            size: meta?.size,
          };
        }
        return null;
      },
    });

    t.int("orderNumber");
    t.json("title", {
      resolve: (...[p]) => daoSharedMapTranslatedColumnsInRowToJson(p, "title"),
    });

    t.json("credits", {
      resolve: (...[p]) =>
        daoSharedMapTranslatedColumnsInRowToJson(p, "credits"),
    });
    t.date("createdAt");
    t.date("updatedAt");
  },
});
