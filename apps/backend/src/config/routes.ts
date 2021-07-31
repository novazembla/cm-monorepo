import { lazy } from "react";

import type { PermissionNames, RoleNames } from "@culturemap/core";

import { getAppConfig } from "~/config";

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

const config = getAppConfig();

export interface RouteParams {
  key: string;
  path: string;
  component: any;
  exact: boolean;
}

export interface RoutePrivateUserCanParams extends RouteParams {
  userCan: PermissionNames | PermissionNames[];
}

export interface RoutePrivateUserIsParams extends RouteParams {
  userIs: RoleNames | RoleNames[];
}

export type RoutePrivateParams =
  | RoutePrivateUserCanParams
  | RoutePrivateUserIsParams;

export const routes: RouteParams[] = [
  {
    key: "email-confirmation",
    path: "/email-confirmation",
    component: EmailConfirmation,
    exact: true,
  },
  // {
  //   key: "profile",
  //   path: "/profile",
  //   component: Profile, // sub routing is handled in that component
  //   exact: false // important, PageSettings is just a new Router switch container
  // }
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

// TODO: implement access protection ...

export const privateRoutes: RoutePrivateParams[] = [
  {
    key: "dashboard",
    path: "/dashboard",
    component: DashBoard,
    exact: true,
    userCan: "accessAsAuthenticatedUser",
  },
  {
    key: "profile",
    path: "/profile",
    component: Profile,
    exact: false,
    userCan: "profileRead",
  },
  {
    key: "users",
    path: "/users",
    component: Users,
    exact: false,
    userIs: "administrator",
  },
  // {
  //   key: "profile",
  //   path: "/profile",
  //   component: Profile, // sub routing is handled in that component
  //   exact: false // important, PageSettings is just a new Router switch container
  // }
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
