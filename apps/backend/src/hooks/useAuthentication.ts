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

  const login = (u: ApiUser) => {
    user.login(u);
  };

  const logout = () => {
    user.logout();
    history.push("/login");
  };

  return [apiUser, { isLoggedIn, login, logout }] as const;
};
