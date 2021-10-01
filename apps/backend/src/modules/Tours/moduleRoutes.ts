import type { RoutePrivateParams } from '~/types';

import Create from "./Create";
import CreateTourStop from "./CreateTourStop";
import Update from "./Update";
import UpdateTourStop from "./UpdateTourStop";
import Index from "./Index";

import { moduleRootPath } from './moduleConfig';

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "create",
    path: `${moduleRootPath}/create`,
    component: Create,
    exact: true,
    userCan: "tourCreate",
  },
  {
    key: "update",
    path: `${moduleRootPath}/update/:id`,
    component: Update,
    exact: true,
    userCan: "tourUpdate",
  },
  {
    key: "tourStopCreate",
    path: `${moduleRootPath}/:tourId/create`,
    component: CreateTourStop,
    exact: true,
    userCan: "tourCreate",
  },
  {
    key: "tourStopUpdate",
    path: `${moduleRootPath}/:tourId/update/:id/`,
    component: UpdateTourStop,
    exact: true,
    userCan: "tourUpdate",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "tourRead",
  }
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};