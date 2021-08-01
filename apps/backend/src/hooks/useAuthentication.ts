import { useHistory } from "react-router";
import { useTypedSelector } from "~/hooks";

import { user } from "~/services";
import type { ApiUser } from "~/services/user";

export const useAuthentication = () => {
  const { authenticated, apiUser } = useTypedSelector(({ user }) => user);

  const history = useHistory();

  const isLoggedIn = (): boolean => {
    return (authenticated && apiUser !== null) || user.isRefreshing();
  };

  const login = async (u: ApiUser): Promise<boolean> => {
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

  return [apiUser, { isLoggedIn, login, logout, logoutAndRedirect }] as const;
};
