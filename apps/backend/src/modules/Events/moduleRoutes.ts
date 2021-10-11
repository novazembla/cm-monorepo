import type { RoutePrivateParams } from '~/types';

import Create from "./Create";
import Update from "./Update";
import Index from "./Index";
import Logs from "./Logs";
import Log from "./Log";

import { moduleRootPath } from './moduleConfig';

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "create",
    path: `${moduleRootPath}/create`,
    component: Create,
    exact: true,
    userCan: "eventCreate",
  },
  {
    key: "update",
    path: `${moduleRootPath}/update/:id`,
    component: Update,
    exact: true,
    userCan: "eventUpdate",
  },
  {
    key: "logs",
    path: `${moduleRootPath}/logs`,
    component: Logs,
    exact: true,
    userCan: "eventRead",
  },
  
  {
    key: "log",
    path: `${moduleRootPath}/log/:id`,
    component: Log,
    exact: true,
    userCan: "eventRead",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "eventRead",
  }
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};