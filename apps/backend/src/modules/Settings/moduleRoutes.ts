import type { RoutePrivateParams, ModuleAccessRules } from '~/config/routes';

import Index from "./Index";
import Update from "./Update";

import { moduleRootPath } from './moduleConfig';

export const moduleAccessRules: ModuleAccessRules = {
  userCan: "settingRead"
}

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    ...moduleAccessRules,
  },
  {
    key: "update",
    path: `${moduleRootPath}/update`,
    component: Update,
    exact: true,
    userCan: "settingUpdate",
  }   
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};