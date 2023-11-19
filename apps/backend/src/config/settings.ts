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
  | "contactEmail"
  | "contactInfo"
  | "suggestionsIntro"
  | "suggestionsIntroEvent"
  | "suggestionsTandCInfo"
  | "suggestionsMetaDesc"
  | "quickSearchInfo"
  | "defaultMetaDesc"
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
  contactEmail: {
    defaultValue: "",
    type: "text",
    // t("settings.contactEmail.label", "Contact email address (receives location suggestion notifications)")
    label: "settings.contactEmail.label",
    validationSchema: object().shape({
      contactEmail: string(),
    }),
    required: true,
  },
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
  suggestionsIntro: {
    defaultValue: "",
    type: "multilangtexteditor",
    // t("settings.suggestionsIntro.label", "Intro of the location suggestion page")
    label: "settings.suggestionsIntro.label",
    validationSchema: object().shape({
      suggestionsIntro: string(),
    }),
    required: true,
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      const config = getAppConfig();
      return config.activeLanguages.reduce(
        (acc: any, lang: any) => ({
          ...acc,

          [lang]: newData[`suggestionsIntro_${lang}`],
        }),
        {}
      );
    },
  },
  suggestionsIntroEvent: {
    defaultValue: "",
    type: "multilangtexteditor",
    // t("settings.suggestionsIntroEvent.label", "Intro of the event suggestion page")
    label: "settings.suggestionsIntroEvent.label",
    validationSchema: object().shape({
      suggestionsIntro: string(),
    }),
    required: true,
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      const config = getAppConfig();
      return config.activeLanguages.reduce(
        (acc: any, lang: any) => ({
          ...acc,

          [lang]: newData[`suggestionsIntroEvent_${lang}`],
        }),
        {}
      );
    },
  },
  suggestionsTandCInfo: {
    defaultValue: "",
    type: "multilangtexteditor",
    // t("settings.suggestionsTandCInfo.label", "Short text above the consent tick box on the suggestion page.")
    label: "settings.suggestionsTandCInfo.label",
    validationSchema: object().shape({
      suggestionsTandCInfo: string(),
    }),
    required: true,
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      const config = getAppConfig();
      return config.activeLanguages.reduce(
        (acc: any, lang: any) => ({
          ...acc,

          [lang]: newData[`suggestionsTandCInfo_${lang}`],
        }),
        {}
      );
    },
  },
  suggestionsMetaDesc: {
    defaultValue: "",
    type: "multilangtextarea",
    // t("settings.suggestionsMetaDesc.label", "Suggestion page meta description.")
    label: "settings.suggestionsMetaDesc.label",
    validationSchema: object().shape({
      suggestionsMetaDesc: string(),
    }),
    required: true,
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      const config = getAppConfig();
      return config.activeLanguages.reduce(
        (acc: any, lang: any) => ({
          ...acc,

          [lang]: newData[`suggestionsMetaDesc_${lang}`],
        }),
        {}
      );
    },
  },
  quickSearchInfo: {
    defaultValue: "",
    type: "multilangtexteditor",
    // t("settings.quickSearchInfo.label", "Short information above quick search")
    label: "settings.quickSearchInfo.label",
    validationSchema: object().shape({
      quickSearchInfo: string(),
    }),
    required: true,
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      const config = getAppConfig();
      return config.activeLanguages.reduce(
        (acc: any, lang: any) => ({
          ...acc,

          [lang]: newData[`quickSearchInfo_${lang}`],
        }),
        {}
      );
    },
  },
  defaultMetaDesc: {
    defaultValue: "",
    type: "multilangtexteditor",
    // t("settings.defaultMetaDesc.label", "Fallback Meta Description")
    label: "settings.defaultMetaDesc.label",
    validationSchema: object().shape({
      suggestionsIntro: string(),
    }),
    required: true,
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      const config = getAppConfig();
      return config.activeLanguages.reduce(
        (acc: any, lang: any) => ({
          ...acc,

          [lang]: newData[`defaultMetaDesc_${lang}`],
        }),
        {}
      );
    },
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
      accessibility: "",
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
      accessibility: string().required(),
    }),
    printComponent: MappedTaxonomies,
    formComponent: MappedTaxonomiesPicker,
    getFormComponentProps: (fieldDefs: AppSettingField, value: any) => {
      return {
        typeOfInstitution:
          value["typeOfInstitution"] ?? fieldDefs.defaultValue.type,
        typeOfOrganisation:
          value["typeOfOrganisation"] ?? fieldDefs.defaultValue.type,
        targetAudience:
          value["targetAudience"] ?? fieldDefs.defaultValue.targetAudience,
        eventType: value["eventType"] ?? fieldDefs.defaultValue.eventType,
        accessibility: value["accessibility"] ?? fieldDefs.defaultValue.accessibility,
      };
    },
    getUpdateValue: (fieldDefs: AppSettingField, newData: any) => {
      return {
        typeOfInstitution: newData["typeOfInstitution"],
        typeOfOrganisation: newData["typeOfOrganisation"],
        targetAudience: newData["targetAudience"],
        eventType: newData["eventType"],
        accessibility: newData["accessibility"],
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
