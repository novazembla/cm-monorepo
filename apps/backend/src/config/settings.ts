import { object, string, number, SchemaOf } from "yup";
import { PartialRecord } from "@culturemap/core";

import { getAppConfig } from "./config";
import { AppConfigSettingsFiledKeys } from "./appconfig";

import { Map } from "~/components/ui";

export type AppSetting = {
  key: string;
  value: any;
};

export type AppSettingField = {
  type: string;
  label: string;
  validationSchema: SchemaOf<any>;
  default: any;
  required: boolean;
  printComponent?: React.FC<any>
};

export type AppSettingsDefaultFieldKeys = "contactEmail" | "adminMapApiKey" | "centerOfGravity";

export type AppSettingsFieldKeys = AppConfigSettingsFiledKeys | AppSettingsDefaultFieldKeys;

export type AppSettingsFieldDefinitions = PartialRecord<AppSettingsFieldKeys, AppSettingField>;

export type AppSettings = PartialRecord<AppSettingsFieldKeys, AppSetting>;

// t("settings.error.label", "No label translation key has been defined")
export const settingFields: AppSettingsFieldDefinitions = {
  contactEmail: {
    default: "",
    type: "email",
    // t("settings.contactEmail.label", "Contact email address")
    label: "settings.contactEmail.label",
    validationSchema: object().shape({
      email: string().required().email(),
    }),
    required: true,
  },
  adminMapApiKey: {
    default: "",
    type: "text",
    // t("settings.adminMapApiKey.label", "Backend Map Api Key")
    label: "settings.adminMapApiKey.label",
    required: true,
    validationSchema: object().shape({
      email: string().required(),
    }),
  },
  centerOfGravity: {
    default: {
      lat: 52.518415,
      lng: 13.407183,
    },
    type: "latlng",
    // t("settings.centerOfGravity.label","Center of map (geo referencing)")
    label: "settings.centerOfGravity.label",
    required: true,
    validationSchema: object().shape({
      lat: number()
        .required()
        .test(
          "is-lat",
          // t("form.error.notCorrectLatitude","This seems not to be a latitiude value")
          "form.error.notCorrectLatitude",
          (value) => !!(value && isFinite(value) && Math.abs(value) <= 90)
        ),
      lng: number()
        .required()
        .test(
          "is-lng",
          // t("form.error.notCorrectLongitude","This seems not to be a longitude value")
          "form.error.notCorrectLongitude",
          (value) => !!(value && isFinite(value) && Math.abs(value) <= 180)
        ),
    }),
    printComponent: Map
  },
};

export const getSettingsDefaultSettings = (): AppSettings => {
  let defaultSettings: AppSettings = Object.keys(settingFields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        key,
        value: settingFields[(key as AppSettingsFieldKeys)]?.default ?? "",
      },
    }),
    {}
  );

  const config = getAppConfig();

  if (config.settings && Array.isArray(Object.keys(config.settings)))
    defaultSettings = Object.keys(config.settings).reduce(
      (acc, key) => ({
        ...acc,
        [key]: {
          key,
          value: config?.settings ? config?.settings[(key as AppSettingsFieldKeys)]?.default ?? "" : "",
        },
      }),
      defaultSettings
    );

  return defaultSettings;
};

export const getSettingsFieldDefinitions = (): AppSettingsFieldDefinitions => {
  const config = getAppConfig();

  return { ...settingFields, ...(config.settings ?? {}) };
};
