import DashBoard from "../modules/DashBoard/DashBoard";
import Login from "../pages/Login/Login";
import PasswordRequest from "../pages/ChangePassword/PasswordRequest";
import PasswordReset from "../pages/ChangePassword/PasswordReset";
import Profile from "../pages/Profile/Profile";
import Signup from "../pages/Signup/Signup";
import EmailConfirmation from "../pages/EmailConfirmation/EmailConfirmation";


export type RouteParams = {
  key: string;
  path: string;
  component: any;
  exact: boolean;
}


export const routes: RouteParams[] = [
  {
    key: "email-confirmation",
    path: "/email-confirmation",
    component: EmailConfirmation,
    exact: true
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
    exact: true
  },
  {
    key: "register",
    path: "/register",
    component: Signup,
    exact: true
  },
  {
    key: "forgot-password",
    path: "/forgot-password",
    component: PasswordRequest,
    exact: true
  },
  {
    key: "reset-password",
    path: "/reset-password",
    component: PasswordReset,
    exact: true
  }
];

export const privateRoutes: RouteParams[] = [
  {
    key: "home",
    path: "/",
    component: DashBoard,
    exact: true
  },
  {
    key: "profile",
    path: "/profile",
    component: Profile,
    exact: false
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
}

export const getPrivateRoutesPathsArray = (): string[] => {
  return privateRoutes.map((route) => route.path);
}

export const getPublicOnlyRoutesPathsArray = (): string[] => {
  return publicOnlyRoutes.map((route) => route.path);
}