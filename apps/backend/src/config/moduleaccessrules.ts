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
  userCan: "pageReadOwn",
};
export const settingsModuleAccessRules: ModuleAccessRules = {
  userCan: "settingRead",
};
export const locationsModuleAccessRules: ModuleAccessRules = {
  userCan: "locationReadOwn",
};
export const eventsModuleAccessRules: ModuleAccessRules = {
  userCan: "eventReadOwn",
};
export const toursModuleAccessRules: ModuleAccessRules = {
  userCan: "tourReadOwn",
};
