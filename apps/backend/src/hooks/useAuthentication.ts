import type { AuthenticatedAppUserData } from "@culturemap/core";
import { createAuthenticatedAppUser } from "@culturemap/core";

import { useHistory } from "react-router";
import { useTypedSelector } from "~/hooks";

import { user } from "~/services";

export const useAuthentication = () => {
  const { authenticated, appUserData } = useTypedSelector(({ user }) => user);

  const appUser =
    appUserData && appUserData?.id && appUserData.firstName
      ? createAuthenticatedAppUser(appUserData, "backend")
      : null;

  const history = useHistory();

  const isLoggedIn = (): boolean => {
    return (authenticated && appUserData !== null) || user.isRefreshing();
  };

  const login = async (u: AuthenticatedAppUserData): Promise<boolean> => {
    return await user.login(u);
  };

  const logout = async () => {
    return await user.logout();
  };

  const logoutAndRedirect = async (path: string = "/login") => {
    const result = await user.logout();
    history.push(path);
    return result;
  };

  return [appUser, { isLoggedIn, login, logout, logoutAndRedirect }] as const;
};
