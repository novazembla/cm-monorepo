import { useHistory } from "react-router";
import { useTypedSelector } from "../hooks";

import { user } from "../services";
import type { AuthenticatedUser } from "../services/user";

export const useAuthentication = () => {
  const { authenticated } = useTypedSelector(({ auth }) => auth);

  const history = useHistory();
  
  const isLoggedIn = (): boolean => {
    return (authenticated && user.get() !== null) || user.isRefreshing();
  };

  const login = (u: AuthenticatedUser) => {
    user.login(u);
  };

  const logout = () => {
    user.logout();
    history.push("/login");
  };

  return [
    user,
    { isLoggedIn, login, logout },
  ] as const;
};
