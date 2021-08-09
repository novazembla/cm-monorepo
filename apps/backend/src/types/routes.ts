
import { RouteProps } from "react-router-dom";

import type { PermissionNames, RoleNames } from "@culturemap/core";

export type RouteCompontent = React.FC | React.FC<{ id: number }> | React.FC<{ key: string }>

export interface RouteParams {
  key: string;
  path: string;
  component: RouteCompontent;
  exact: boolean;
}

export interface RoutePrivateUserCanParams extends RouteParams {
  userCan: PermissionNames | PermissionNames[];
}

export interface RoutePrivateUserIsParams extends RouteParams {
  userIs: RoleNames | RoleNames[];
}

export interface ModuleAccessRules {
  userIs?: RoleNames | RoleNames[] | undefined;
  userCan?: PermissionNames | PermissionNames[] | undefined;
}

export interface RoutePrivateParams extends RouteParams, ModuleAccessRules {}

export interface AppRouteProps extends RouteProps, ModuleAccessRules {
  key: string;
}