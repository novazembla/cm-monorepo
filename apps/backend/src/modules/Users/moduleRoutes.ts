import type { RoutePrivateParams, ModuleAccessRules } from '~/config/routes';

import Add from "./Add";
import Update from "./Update";
import Index from "./Index";

import { moduleRootPath } from './moduleConfig';

export const moduleAccessRules: ModuleAccessRules = {
  userCan: "userRead"
}

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "add",
    path: `${moduleRootPath}/create`,
    component: Add,
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