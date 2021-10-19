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
import { daoSettingQuery, daoSettingGetById } from "../../dao";
import { settingUpsertSettings } from "../../services/serviceSetting";
import { ApiError } from "../../utils";
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
