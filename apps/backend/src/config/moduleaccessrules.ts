import type { ModuleAccessRules } from "~/types";

export const dashboadModuleAccessRules: ModuleAccessRules = {
  userCan: "accessAsAuthenticatedUser",
};
export const profileModuleAccessRules: ModuleAccessRules = {
  userCan: "profileUpdate",
};
export const taxonomiesModuleAccessRules: ModuleAccessRules = {
  userCan: "taxRead",
};
export const usersModuleAccessRules: ModuleAccessRules = {
  userCan: "userRead",
};
export const pagesModuleAccessRules: ModuleAccessRules = {
  userCan: "pageRead",
};
export const settingsModuleAccessRules: ModuleAccessRules = {
  userCan: "settingRead",
};
export const locationsModuleAccessRules: ModuleAccessRules = {
  userCan: "locationRead",
};
export const eventsModuleAccessRules: ModuleAccessRules = {
  userCan: "eventRead",
};
export const toursModuleAccessRules: ModuleAccessRules = {
  userCan: "tourRead",
};
