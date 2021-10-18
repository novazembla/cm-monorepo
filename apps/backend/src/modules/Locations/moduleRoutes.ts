import type { RoutePrivateParams } from "~/types";

import Create from "./Create";
import Update from "./Update";
import Index from "./Index";
import Import from "./Import";
import ImportCreate from "./ImportCreate";
import ImportUpdate from "./ImportUpdate";

import { moduleRootPath } from "./moduleConfig";
import DataExports from "./DataExports";
import Export from "./Export";

export const moduleRoutes: RoutePrivateParams[] = [
  {
    key: "create",
    path: `${moduleRootPath}/create`,
    component: Create,
    exact: true,
    userCan: "locationCreate",
  },
  {
    key: "import",
    path: `${moduleRootPath}/import`,
    component: Import,
    exact: true,
    userCan: "locationCreate",
  },
  {
    key: "importcreate",
    path: `${moduleRootPath}/import/create`,
    component: ImportCreate,
    exact: true,
    userCan: "locationCreate",
  },
  {
    key: "importupdate",
    path: `${moduleRootPath}/import/:id`,
    component: ImportUpdate,
    exact: true,
    userCan: "locationCreate",
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
    key: "update",
    path: `${moduleRootPath}/update/:id`,
    component: Update,
    exact: true,
    userCan: "locationUpdateOwn",
  },
  {
    key: "index",
    path: `${moduleRootPath}`,
    component: Index,
    exact: true,
    userCan: "locationReadOwn",
  },
];

export const getModuleRoutesPathsArray = (): string[] => {
  return moduleRoutes.map((route) => route.path);
};
