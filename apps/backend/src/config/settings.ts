import i18next from "i18next";

export const settingsFields = {
  contactEmail: {
    type: "email",
    label: i18next.t("settings.contactEmail.label", "Contact email address"),
    required: true,
  },
};

// TODO: make real
export let settings = {
  contactEmail: "peter@peter.com"
}

export default settings;
