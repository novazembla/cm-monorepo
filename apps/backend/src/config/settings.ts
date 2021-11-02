import { object, string, number, SchemaOf } from "yup";
import { PartialRecord } from "@culturemap/core";

import { getAppConfig } from "./config";
import { AppConfigSettingsFieldKeys } from "./tmpappconfig";

import { MapLocation } from "~/components/ui";
import { LocationPicker } from "~/components/forms";
import { MappedTaxonomies } from "~/components/ui";
import { MappedTaxonomiesPicker } from "~/components/forms";

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
  | "contactInfo"
  | "frontendMapStyeJsonUrl"
  | "taxMapping"
  | "centerOfGravity";

export type AppSettingsFieldKeys =
  | AppConfigSettingsFieldKeys
  | AppSettingsDefaultFieldKeys;

export type AppSettingsFieldDefinitions = PartialRecord<
  AppSettingsFieldKeys,
  AppSettingField
>;

export type AppSettings = PartialRecord<AppSettingsFieldKeys, AppSetting>;

// t("settings.error.label", "No label translation key has been defined")
export const settingFields: AppSettingsFieldDefinitions = {
  contactInfo: {
    defaultValue: "",
    type: "texteditor",
    // t("settings.contactInfo.label", "Contact information at bottom of admin tool")
    label: "settings.contactInfo.label",
    validationSchema: object().shape({
      contactInfo: string(),
    }),
    required: true,
  },
  frontendMapStyeJsonUrl: {
    defaultValue: "",
    type: "text",
    // t("settings.frontendMapStyeJsonUrl.label", "Frontend Map Style Json Url")
    label: "settings.frontendMapStyeJsonUrl.label",
    required: true,
    validationSchema: object().shape({
      frontendMapStyeJsonUrl: string().required(),
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
    printComponent: MapLocation,
    formComponent: LocationPicker,
    getFormComponentProps: (fieldDefs: AppSettingField, value: any) => {
      return {
        lng: value["lng"] ?? fieldDefs.defaultValue.lng,
        lat: value["lat"] ?? fieldDefs.defaultValue.lat,
      };
    },
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      return {
        lng: newData["lng"],
        lat: newData["lat"],
      };
    },
  },
  taxMapping: {
    defaultValue: {
      typeOfInstitution: "",
      typeOfOrganisation: "",
      eventType: "",
      targetAudience: "",
    },
    type: "taxMapping",
    // t("settings.taxMapping.label","Mapped taxonomies")
    label: "settings.taxMapping.label",
    required: true,
    validationSchema: object().shape({
      typeOfInstitution: string().required(),
      typeOfOrganisation: string().required(),
      targetAudience: string().required(),
      eventType: string().required(),
    }),
    printComponent: MappedTaxonomies,
    formComponent: MappedTaxonomiesPicker,
    getFormComponentProps: (fieldDefs: AppSettingField, value: any) => {
      return {
        typeOfInstitution: value["typeOfInstitution"] ?? fieldDefs.defaultValue.type,
        typeOfOrganisation: value["typeOfOrganisation"] ?? fieldDefs.defaultValue.type,
        targetAudience:
          value["targetAudience"] ?? fieldDefs.defaultValue.targetAudience,
        eventType: value["eventType"] ?? fieldDefs.defaultValue.eventType,
      };
    },
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      return {
        typeOfInstitution: newData["typeOfInstitution"],
        typeOfOrganisation: newData["typeOfOrganisation"],
        targetAudience: newData["targetAudience"],
        eventType: newData["eventType"],
      };
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
      completeSchema = fieldDefs[setting]?.validationSchema;
    } else {
      completeSchema = completeSchema.concat(
        fieldDefs[setting]?.validationSchema
      );
    }
  });

  return completeSchema;
};
