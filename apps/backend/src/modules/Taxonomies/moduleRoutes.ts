import type { RoutePrivateParams, ModuleAccessRules } from '~/config/routes';

import Create from "./Create";
import Update from "./Update";
import Index from "./Index";

import { moduleRootPath } from './moduleConfig';

export const moduleAccessRules: ModuleAccessRules = {
  userCan: "taxRead"
}

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "create",
    path: `${moduleRootPath}/create`,
    component: Create,
    exact: true,
    userCan: "taxCreate",
  },
  {
    key: "update",
    path: `${moduleRootPath}/update/:id`,
    component: Update,
    exact: true,
    userCan: "taxUpdate",
  },
  {
    key: "terms",
    path: `${moduleRootPath}/:id/terms`,
    component: Create,
    exact: true,
    userCan: "taxCreate",
  },
  {
    key: "termCreate",
    path: `${moduleRootPath}/:id/create`,
    component: Create,
    exact: true,
    userCan: "taxCreate",
  },
  {
    key: "termUpdate",
    path: `${moduleRootPath}/:id/update`,
    component: Update,
    exact: true,
    userCan: "taxUpdate",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "taxRead",
  }
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};