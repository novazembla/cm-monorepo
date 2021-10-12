/// <reference path="../../types/nexus-typegen.ts" />

import { objectType, extendType, stringArg, nonNull } from "nexus";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { daoModuleQueryAll, daoModuleGetWithTaxonomiesByKey } from "../../dao";

// TODO this white listing of keys is rather annoying,
const FIELD_KEYS_SETTING = [
  "id",
  "key",
  "withTaxonomies",
  "createdAt",
  "updatedAt",
];

export const ModuleGQL = objectType({
  name: "Module",
  definition(t) {
    t.nonNull.int("id");
    t.string("key");
    t.json("name");
    t.boolean("withTaxonomies");
  },
});

export const ModuleQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("modules", {
      type: "Module",

      // resolve(root, args, ctx, info)
      async resolve() {
        const modules = await daoModuleQueryAll();

        return filteredOutputByWhitelist(modules, FIELD_KEYS_SETTING, ["name"]);
      },
    });

    t.list.field("moduleTaxonomies", {
      type: "Taxonomy",

      args: {
        key: nonNull(stringArg()),
      },

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        // V2, you can't really sort JSON fields
        const module = await daoModuleGetWithTaxonomiesByKey(
          {
            key: args.key,
          },
          {
            taxonomies: {
              orderBy: {
                fullText: "asc",
              },
              select: {
                id: true,
                name: true,
                collectPrimaryTerm: true,
                isRequired: true,
                hasColor: true,
                slug: true,
                terms: {
                  orderBy: {
                    fullText: "asc",
                  },
                  select: {
                    id: true,
                    name: true,
                    slug: true,
                  },
                },
              },
            },
          }
        );

        if (!module || !(module as any).taxonomies) return null;

        return filteredOutputByWhitelist(
          (module as any).taxonomies,
          FIELD_KEYS_SETTING,
          [
            "id",
            "name",
            "slug",
            "hasColor",
            "isRequired",
            "collectPrimaryTerm",
            "terms",
          ]
        );
      },
    });
  },
});
