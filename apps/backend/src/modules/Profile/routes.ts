import type { RoutePrivateParams } from '~/config/routes';

import Index from "./Index";
import Password from "./Password";
import Update from "./Update";

import { moduleRootPath } from './config';
// TODO: implement access protection ... 
// also how to ensure user can only access own ... items ... 
// 
export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "password",
    path: `${moduleRootPath}/password`,
    component: Password,
    exact: true,
    userCan: "profileUpdate",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "profileUpdate",
  },
  {
    key: "update",
    path: `${moduleRootPath}/update`,
    component: Update,
    exact: true,
    userCan: "profileUpdate",
  }   
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};