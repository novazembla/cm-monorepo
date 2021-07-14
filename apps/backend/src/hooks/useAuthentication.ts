import { useHistory, useLocation } from "react-router";
import { useApolloClient } from "@apollo/client";
import { useTypedDispatch, useTypedSelector } from "../hooks";
import { authLogout, authLogin } from "../redux/slices/authentication";

import { userRefreshMutationGQL } from "../graphql/mutations";
import { useAuthTabWideLogout } from ".";
import { authentication, Token } from "../services/authentication";

export interface AuthenticatedUser {
  id: number;
  roles: string[];
  permissions: string[];
}

let user: AuthenticatedUser | null = null;
let refreshing = false;
let currentPath = "";

export const useAuthentication = () => {
  const { authenticated } = useTypedSelector(({ auth }) => auth);
  const client = useApolloClient();
  const dispatch = useTypedDispatch();
  const [, setAccessInfo] = useAuthTabWideLogout();
  const history = useHistory();
  const location = useLocation();

  const refreshAccessToken = (onSuccess?: Function | undefined, onFail?: Function | undefined) => {
    client
    .mutate({
      mutation: userRefreshMutationGQL,
    })
    // TODO: is there a way to get a typed query here? 
    .then(({ data }: any) => {
      if (
        data?.userRefresh?.tokens?.access &&
        data?.userRefresh?.tokens?.refresh
      ) {
        const payload = authentication.getTokenPayload(
          data.userRefresh.tokens.access
        );

        if (payload) {
          console.log("Refreshed", data.userRefresh);
          authentication.setAuthToken(data.userRefresh.tokens.access);
          authentication.setRefreshCookie(
            data.userRefresh.tokens.refresh
          );
          
          if (onSuccess)
            onSuccess.apply(this, [payload.user]);

        } else {
          if (onFail)
            onFail.call(this);
        }
      } else {
        if (onFail)
          onFail.call(this);
      }
    })
    .catch(() => {
      if (onFail)
        onFail.call(this);
    });
  }
  const retrieveUser = () => {
    const timeOutCookie = authentication.getRefreshTimeOutCookie();

    if (!user || !timeOutCookie) {
      let tryRefresh = false;
    
      if (authentication.getAuthToken()) {
        const tokenPayload = authentication.getTokenPayload(
          authentication.getAuthToken() as Token
        );
    
        if (tokenPayload?.user) {
          user = tokenPayload.user;
        } else {
          tryRefresh = true;
        }
    
      } else {
        tryRefresh = true;
      }

      if (tryRefresh) {
        
        const refreshCookie = authentication.getRefreshCookie();
        
        if (refreshCookie === "active" && !refreshing) {
          refreshing = true;
          
          currentPath = location.pathname;
          
          refreshAccessToken((user: AuthenticatedUser) => {
            refreshing = false;
            login(user);
            history.push(currentPath);
          }, logout);

        }
      }
    }
  };

  const setUser = (justLoggedInUser: AuthenticatedUser) => user = justLoggedInUser;

  const getUser = (): AuthenticatedUser | null => {
    retrieveUser();
    return user;
  };

  const isLoggedIn = (): boolean => {
    retrieveUser();
    return (authenticated && user !== null) || refreshing;
  };

  const login = (justLoggedInUser: AuthenticatedUser) => {
    refreshing = false;
    user = justLoggedInUser;
    dispatch(authLogin());
    setAccessInfo("logged-in");
  };

  const logout = () => {
    currentPath = "/";
    refreshing = false;
    client.clearStore();
    authentication.removeAuthToken();
    authentication.removeRefreshCookie();
    user = null;
    dispatch(authLogout());
    setAccessInfo("logged-out");
  };

  return [user, { isLoggedIn, getUser, setUser, refreshAccessToken, login, logout }] as const;
};
