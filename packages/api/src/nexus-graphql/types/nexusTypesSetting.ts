/// <reference path="../../types/nexus-typegen.ts" />

import {
  objectType,
  extendType,
  inputObjectType,
  nonNull,
  intArg,
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

      // resolve(root, args, ctx, info)
      async resolve() {
        const settings = await daoSettingQuery();

        return filteredOutputByWhitelist(
          [
            ...settings,
            ...[
              {
                key: "test",
                id: "1",
                value: {
                  k: "t",
                  s: "s",
                },
              },
            ],
          ],
          FIELD_KEYS_SETTING,
          "value"
        );
      },
    });
  },
});

export const SettingQuery = extendType({
  type: "Query",
  definition(t) {
    t.list.field("setting", {
      type: Setting,

      args: {
        id: nonNull(intArg()),
      },

      authorize: async (...[, , ctx]) => authorizeApiUser(ctx, "settingUpdate"),

      // resolve(root, args, ctx, info)
      async resolve(...[, args]) {
        const setting = daoSettingGetById(args.id);

        return filteredOutputByWhitelist(setting, FIELD_KEYS_SETTING, "value");
      },
    });
  },
});

export const SettingInput = inputObjectType({
  name: "SettingInput",
  definition(t) {
    t.nonNull.string("key");
    t.nonNull.json("value");
  },
});

export const SettingUpdateMutation = extendType({
  type: "Mutation",

  definition(t) {
    t.nonNull.field("settingsUpdate", {
      type: BooleanResult,
      args: {
        data: list(nonNull(SettingInput)),
      },

      authorize: async (...[, , ctx]) => authorizeApiUser(ctx, "settingUpdate"),

      async resolve(...[, args]) {
        if (!args?.data)
          throw new ApiError(httpStatus.BAD_REQUEST, "Bad data supplied");

        const result = await settingUpsertSettings(args.data);

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

export default FIELD_KEYS_SETTING;
