// xxx make better ... TODO: 
import i18next from "i18next";

export type AppSettingField = {
  type: string;
  label: string;
  required: boolean;
}

export const settingFields: Record<string, AppSettingField> = {
  contactEmail: {
    type: "email",
    label: i18next.t("settings.contactEmail.label", "Contact email address"),
    required: true,
  },
};

// TODO: make real taken from DB, save in redux store ... bla bla bla 
export let settingValues = {
  contactEmail: "peter@peter.com"
}

export default settingValues;
