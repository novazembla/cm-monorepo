import DashBoard from "../modules/DashBoard/DashBoard";
import Login from "../pages/Login/Login";
import PasswordReminder from "../pages/PasswordReminder/PasswordReminder";
import Profile from "../pages/Profile/Profile";
import Register from "../pages/Register/Register";

export const publicOnlyRoutes = [
  {
    key: "login",
    path: "/login",
    component: Login,
    exact: true
  },
  {
    key: "register",
    path: "/register",
    component: Register,
    exact: true
  },
  {
    key: "forgot-password",
    path: "/forgot-password",
    component: PasswordReminder,
    exact: true
  }
];

export const privateRoutes = [
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