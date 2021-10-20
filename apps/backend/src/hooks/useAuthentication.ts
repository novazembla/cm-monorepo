import type { AuthenticatedAppUserData } from "@culturemap/core";
import { createAuthenticatedAppUser } from "@culturemap/core";

import { useHistory } from "react-router";
import { useConfig, useTypedSelector } from "~/hooks";

import { user, authentication } from "~/services";

export const useAuthentication = () => {
  const { authenticated, appUserData } = useTypedSelector(({ user }) => user);
  const config = useConfig();
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

  const getPreviewUrl = (slug: string) => {
    return `${config.frontendUrl}/api/preview?secret=${
      config.frontendPreviewSecret
    }&token=${authentication.getPreviewToken()?.token}&slug=${slug}`;
  };
  return [appUser, { isLoggedIn, login, logout, logoutAndRedirect, getPreviewUrl }] as const;
};
