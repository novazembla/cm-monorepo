import type { RoutePrivateParams, ModuleAccessRules } from '~/config/routes';

import Create from "./Create";
import CreateTerm from "./CreateTerm";
import Update from "./Update";
import UpdateTerm from "./UpdateTerm";
import Index from "./Index";
import Terms from "./Terms";

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
    path: `${moduleRootPath}/:taxId/terms`,
    component: Terms,
    exact: true,
    userCan: "taxCreate",
  },
  {
    key: "termCreate",
    path: `${moduleRootPath}/:taxId/create`,
    component: CreateTerm,
    exact: true,
    userCan: "taxCreate",
  },
  {
    key: "termUpdate",
    path: `${moduleRootPath}/:taxId/update/:id/`,
    component: UpdateTerm,
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