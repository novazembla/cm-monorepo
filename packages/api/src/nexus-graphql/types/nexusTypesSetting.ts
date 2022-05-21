/// <reference path="../../types/nexus-typegen.ts" />

import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  intArg,
  stringArg,
  list,
} from "nexus";
import httpStatus from "http-status";
import { filteredOutputByWhitelist } from "@culturemap/core";

import { BooleanResult } from "./nexusTypesShared";
import {
  daoSettingQuery,
  daoSettingGetById,
  daoTaxonomySelectQuery,
  daoSharedGetTranslatedSelectColumns,
} from "../../dao";
import { settingUpsertSettings } from "../../services/serviceSetting";
import { ApiError, parseSettings } from "../../utils";
import { authorizeApiUser } from "../helpers";

// TODO this white listing of keys is rather annoying,
const FIELD_KEYS_SETTING = ["id", "key", "value", "createdAt", "updatedAt"];

export const Setting = objectType({
  name: "Setting",
  definition(t) {
    t.nonNull.int("id");
    t.string("key");
    t.string("scope");
    t.json("value");
    t.date("createdAt");
    t.date("updatedAt");
  },
});

export const FrontendSettings = objectType({
  name: "FrontendSettings",
  definition(t) {
    t.json("suggestionsIntro");
    t.json("suggestionsMetaDesc");
    t.json("suggestionsTandCInfo");
    t.json("centerOfGravity");
    t.json("taxMapping");
    t.string("mapJsonUrl");
    t.list.field("taxonomies", {
      type: "Taxonomy",
    });
  },
});

export const SettingsQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("settings", {
      type: Setting,

      args: {
        scope: nonNull(stringArg()),
      },

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        const settings = await daoSettingQuery({
          scope: args.scope,
        });
        return filteredOutputByWhitelist(settings, FIELD_KEYS_SETTING, "value");
      },
    });

    t.list.field("setting", {
      type: Setting,

      args: {
        id: nonNull(intArg()),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "settingRead"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        const setting = daoSettingGetById(args.id);

        return filteredOutputByWhitelist(setting, FIELD_KEYS_SETTING, "value");
      },
    });

    t.field("frontendSettings", {
      type: "FrontendSettings",

      async resolve() {
        const settingsInDb = await daoSettingQuery({
          scope: "settings",
        });

        const settings = parseSettings(settingsInDb);

        const taxonomies = await daoTaxonomySelectQuery(
          {
            id: {
              in: settings?.taxMapping
                ? Object.keys(settings.taxMapping).reduce(
                    (acc: any, key: any) => {
                      acc.push(parseInt(settings.taxMapping[key] ?? "0"));
                      return acc;
                    },
                    []
                  )
                : [],
            },
          },
          {
            id: true,
            ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),

            terms: {
              select: {
                id: true,
                color: true,
                colorDark: true,
                taxonomyId: true,
                ...daoSharedGetTranslatedSelectColumns(["name", "slug"]),
                events: true,
                locations: true,
              },
            },
          },
          undefined
        );
        return {
          centerOfGravity: settings?.centerOfGravity,
          taxMapping: settings?.taxMapping,
          suggestionsIntro: settings?.suggestionsIntro,
          suggestionsMetaDesc: settings?.suggestionsMetaDesc,
          suggestionsTandCInfo: settings?.suggestionsTandCInfo,
          taxonomies: taxonomies?.length
            ? taxonomies.map((tax: any) => ({
                ...tax,
                terms:
                  tax?.terms?.length > 0
                    ? tax?.terms.map((tt: any) => ({
                        ...tt,
                        _count: {
                          locations: tt?.locations?.length ?? 0,
                          events: tt?.events?.length ?? 0,
                        },
                      }))
                    : [],
              }))
            : [],
          mapJsonUrl: settings?.frontendMapStyeJsonUrl,
        };
      },
    });
  },
});

export const SettingsUpdateInput = inputObjectType({
  name: "SettingsUpdateInput",
  definition(t) {
    t.nonNull.string("key");
    t.nonNull.string("scope");
    t.nonNull.json("value");
  },
});

export const SettingUpdateMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("settingsUpdate", {
      type: BooleanResult,
      args: {
        data: list(nonNull(SettingsUpdateInput)),
      },

      authorize: (...[, , ctx]) => authorizeApiUser(ctx, "settingUpdate"),

      async resolve(...[, args]) {
        let result = false;

        if (args?.data) result = await settingUpsertSettings(args.data);

        if (!result)
          throw new ApiError(
            httpStatus.INTERNAL_SERVER_ERROR,
            "Settings update failed"
          );

        return { result };
      },
    });
  },
});
