import type { RoutePrivateParams, ModuleAccessRules } from '~/types';

import Create from "./Create";
import Update from "./Update";
import Index from "./Index";

import { moduleRootPath } from './moduleConfig';

export const moduleAccessRules: ModuleAccessRules = {
  userCan: "userRead"
}

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "create",
    path: `${moduleRootPath}/create`,
    component: Create,
    exact: true,
    userCan: "userCreate",
  },
  {
    key: "update",
    path: `${moduleRootPath}/update/:id`,
    component: Update,
    exact: true,
    userCan: "userUpdate",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "userRead",
  }
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};