import type { RoutePrivateParams } from '~/config/routes';

import Add from "./Add";
import Update from "./Update";
import Index from "./Index";

import { moduleRootPath } from './config';
// TODO: implement access protection ... 
// also how to ensure user can only access own ... items ... 
// 
export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "add",
    path: `${moduleRootPath}/create`,
    component: Add,
    exact: true,
    userIs: "administrator",
  },
  {
    key: "update",
    path: `${moduleRootPath}/update/:id`,
    component: Update,
    exact: true,
    userIs: "administrator",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userIs: "administrator",
  }
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};