import { lazy } from "react";

import { getAppConfig } from "~/config/config";
import { RouteParams, RoutePrivateParams} from "~/types";
import { dashboadModuleAccessRules,
  profileModuleAccessRules,
  taxonomiesModuleAccessRules,
  usersModuleAccessRules,
  pagesModuleAccessRules,
  settingsModuleAccessRules,
  locationsModuleAccessRules,
  eventsModuleAccessRules,toursModuleAccessRules, } from "./moduleaccessrules";


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
const Taxonomies = lazy(() => import("~/modules/Taxonomies/Taxonomies"));
const Pages = lazy(() => import("~/modules/Pages/Pages"));
const Tours = lazy(() => import("~/modules/Tours/Tours"));
const Locations = lazy(() => import("~/modules/Locations/Locations"));
const Events = lazy(() => import("~/modules/Events/Events"));
const Settings = lazy(() => import("~/modules/Settings/Settings"));

const config = getAppConfig();


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

if (config.enableOpenRegistration) {
  publicOnlyRoutes.push({
    key: "register",
    path: "/register",
    component: Signup,
    exact: true,
  });
}

export const privateRoutes: RoutePrivateParams[] = [
  {
    key: "homepage",
    path: "/homepage",
    component: DashBoard,
    exact: true,
    ...dashboadModuleAccessRules,
  },
  {
    key: "locations",
    path: "/locations",
    component: Locations,
    exact: false,
    ...locationsModuleAccessRules,
  },
  {
    key: "events",
    path: "/events",
    component: Events,
    exact: false,
    ...eventsModuleAccessRules,
  },
  {
    key: "profile",
    path: "/profile",
    component: Profile,
    exact: false,
    ...profileModuleAccessRules,
  },
  {
    key: "pages",
    path: "/pages",
    component: Pages,
    exact: false,
    ...pagesModuleAccessRules,
  },
  {
    key: "tours",
    path: "/tours",
    component: Tours,
    exact: false,
    ...toursModuleAccessRules,
  },
  {
    key: "taxonomies",
    path: "/taxonomies",
    component: Taxonomies,
    exact: false,
    ...taxonomiesModuleAccessRules,
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
