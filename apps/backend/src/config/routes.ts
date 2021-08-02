import React, { lazy } from "react";
import { RouteProps } from "react-router-dom";

import type { PermissionNames, RoleNames } from "@culturemap/core";

import { getAppConfig } from "~/config";

import { moduleAccessRules as dashboadModuleAccessRules } from "~/modules/DashBoard/routes";
import { moduleAccessRules as profileModuleAccessRules } from "~/modules/Profile/routes";
import { moduleAccessRules as usersModuleAccessRules } from "~/modules/Users/routes";
import { moduleAccessRules as settingsModuleAccessRules } from "~/modules/Settings/routes";

// Public
const Login = lazy(() => import("~/pages/Login/Login"));
const PasswordRequest = lazy(
  () => import("~/pages/ChangePassword/PasswordRequest")
);
const PasswordReset = lazy(
  () => import("~/pages/ChangePassword/PasswordReset")
);
const PasswordHasBeenReset = lazy(
  () => import("~/pages/ChangePassword/PasswordHasBeenReset")
);

const Profile = lazy(() => import("~/modules/Profile/Profile"));
const Signup = lazy(() => import("~/pages/Signup/Signup"));

// Public/Private
const EmailConfirmation = lazy(
  () => import("~/pages/EmailConfirmation/EmailConfirmation")
);

// Private
const DashBoard = lazy(() => import("~/modules/DashBoard/DashBoard"));
const Users = lazy(() => import("~/modules/Users/Users"));
const Settings = lazy(() => import("~/modules/Settings/Settings"));

const config = getAppConfig();

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

export const routes: RouteParams[] = [
  {
    key: "email-confirmation",
    path: "/email-confirmation",
    component: EmailConfirmation,
    exact: true,
  },
];

export const publicOnlyRoutes: RouteParams[] = [
  {
    key: "login",
    path: "/login",
    component: Login,
    exact: true,
  },

  {
    key: "forgot-password",
    path: "/forgot-password",
    component: PasswordRequest,
    exact: true,
  },
  {
    key: "reset-password",
    path: "/reset-password",
    component: PasswordReset,
    exact: true,
  },
  {
    key: "password-has-been-reset",
    path: "/password-has-been-reset",
    component: PasswordHasBeenReset,
    exact: true,
  },
];

if (config.enableRegistration) {
  publicOnlyRoutes.push({
    key: "register",
    path: "/register",
    component: Signup,
    exact: true,
  });
}

export const privateRoutes: RoutePrivateParams[] = [
  {
    key: "dashboard",
    path: "/dashboard",
    component: DashBoard,
    exact: true,
    ...dashboadModuleAccessRules,
  },
  {
    key: "profile",
    path: "/profile",
    component: Profile,
    exact: false,
    ...profileModuleAccessRules,
  },
  {
    key: "users",
    path: "/users",
    component: Users,
    exact: false,
    ...usersModuleAccessRules,
  },
  {
    key: "settings",
    path: "/settings",
    component: Settings,
    exact: false,
    ...settingsModuleAccessRules,
  },
];

export const getRoutesPathsArray = (): string[] => {
  return routes.map((route) => route.path);
};

export const getPrivateRoutesPathsArray = (): string[] => {
  return privateRoutes.map((route) => route.path);
};

export const getPublicOnlyRoutesPathsArray = (): string[] => {
  return publicOnlyRoutes.map((route) => route.path);
};
