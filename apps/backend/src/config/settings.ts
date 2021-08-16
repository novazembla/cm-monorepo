import { object, string, number, SchemaOf } from "yup";
import { PartialRecord } from "@culturemap/core";

import { getAppConfig } from "./config";
import { AppConfigSettingsFiledKeys } from "./tmpappconfig";

import { Map } from "~/components/ui";
import { LocationPicker } from "~/components/forms";

export type AppSetting = {
  key: string;
  value: any;
};

export type AppSettingField = {
  type: string;
  label: string;
  validationSchema: SchemaOf<any>;
  defaultValue: any;
  required: boolean;
  printComponent?: React.FC<any>;
  formComponent?: React.FC<any>;
  getFormComponentProps?(fieldDefs: AppSettingField, value: any): any;
  getUpdateValue?(fieldDefs: AppSettingField, newData: any): any;
};

export type AppSettingsDefaultFieldKeys =
  | "contactEmail"
  | "adminMapApiKey"
  | "centerOfGravity";

export type AppSettingsFieldKeys =
  | AppConfigSettingsFiledKeys
  | AppSettingsDefaultFieldKeys;

export type AppSettingsFieldDefinitions = PartialRecord<
  AppSettingsFieldKeys,
  AppSettingField
>;

export type AppSettings = PartialRecord<AppSettingsFieldKeys, AppSetting>;

// t("settings.error.label", "No label translation key has been defined")
export const settingFields: AppSettingsFieldDefinitions = {
  contactEmail: {
    defaultValue: "",
    type: "email",
    // t("settings.contactEmail.label", "Contact email address")
    label: "settings.contactEmail.label",
    validationSchema: object().shape({
      contactEmail: string().email().required()
    }),
    required: true,
  },
  adminMapApiKey: {
    defaultValue: "",
    type: "text",
    // t("settings.adminMapApiKey.label", "Backend Map Api Key")
    label: "settings.adminMapApiKey.label",
    required: true,
    validationSchema: object().shape({
      adminMapApiKey: string().required()
    }),
  },
  centerOfGravity: {
    defaultValue: {
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
    printComponent: Map,
    formComponent: LocationPicker,
    getFormComponentProps: (fieldDefs: AppSettingField, value: any) => {
      return {
        lng: value["lng"] ?? fieldDefs.defaultValue.lng,
        lat: value["lat"] ?? fieldDefs.defaultValue.lat,
      }
    },
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      return {
        lng: newData["lng"],
        lat: newData["lat"],
      }
    },
  },
};

export const getSettingsDefaultSettings = (): AppSettings => {
  let defaultSettings: AppSettings = Object.keys(settingFields).reduce(
    (acc, key) => ({
      ...acc,
      [key]: {
        key,
        value: settingFields[key as AppSettingsFieldKeys]?.defaultValue ?? "",
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
          value: config?.settings
            ? config?.settings[key as AppSettingsFieldKeys]?.defaultValue ?? ""
            : "",
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

export const getSettingsFieldKeys = (): AppSettingsFieldKeys[] =>
  Object.keys(getSettingsFieldDefinitions()) as AppSettingsFieldKeys[];

export const getSettingsValidationSchema = () => {
  const fieldDefs = getSettingsFieldDefinitions();

  let completeSchema: any = undefined;

  (Object.keys(fieldDefs) as AppSettingsFieldKeys[]).forEach((setting) => {
    if (!completeSchema) {
      completeSchema = fieldDefs[setting]?.validationSchema
    } else {
      completeSchema = completeSchema.concat(fieldDefs[setting]?.validationSchema)
    }
      
  });

  return completeSchema;
  
};
