import type { RoutePrivateParams } from '~/types';

import Create from "./Create";
import Update from "./Update";
import Index from "./Index";
import Logs from "./Logs";
import Log from "./Log";
import DataExports from "./DataExports";
import Export from "./Export";

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
    userCan: "eventUpdateOwn",
  },
  {
    key: "logs",
    path: `${moduleRootPath}/logs`,
    component: Logs,
    exact: true,
    userCan: "eventReadOwn",
  },
  {
    key: "exports",
    path: `${moduleRootPath}/exports`,
    component: DataExports,
    exact: true,
    userCan: "locationUpdateOwn",
  },{
    key: "export",
    path: `${moduleRootPath}/export/:id`,
    component: Export,
    exact: true,
    userCan: "locationUpdateOwn",
  },
  
  {
    key: "log",
    path: `${moduleRootPath}/log/:id`,
    component: Log,
    exact: true,
    userCan: "eventReadOwn",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "eventReadOwn",
  }
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};