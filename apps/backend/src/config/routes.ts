import { lazy } from "react";
import { config } from "./culturemap";

const DashBoard = lazy(() => import("~/modules/DashBoard/DashBoard"));
const Login = lazy(() => import("~/pages/Login/Login"));
const PasswordRequest = lazy(() => import("~/pages/ChangePassword/PasswordRequest"));
const PasswordReset = lazy(() => import("~/pages/ChangePassword/PasswordReset"));
const Profile = lazy(() => import("~/pages/Profile/Profile"));
const Signup = lazy(() => import("~/pages/Signup/Signup"));
const EmailConfirmation = lazy(() => import("~/pages/EmailConfirmation/EmailConfirmation"));

export type RouteParams = {
  key: string;
  path: string;
  component: any;
  exact: boolean;
};

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
];

if (config.enableRegistration) {
  publicOnlyRoutes.push({
    key: "register",
    path: "/register",
    component: Signup,
    exact: true,
  });
}

export const privateRoutes: RouteParams[] = [
  {
    key: "home",
    path: "/",
    component: DashBoard,
    exact: true,
  },
  {
    key: "profile",
    path: "/profile",
    component: Profile,
    exact: false,
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
