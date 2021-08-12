import type { RoutePrivateParams } from '~/types';

import Index from "./Index";
import Update from "./Update";

import { moduleRootPath } from './moduleConfig';

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "settingRead"
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