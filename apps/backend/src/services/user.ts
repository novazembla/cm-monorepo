import { authRefreshMutationGQL } from "@culturemap/core";

import { client } from "./apollo";
import { authentication } from ".";
import { getAuthToken, getRefreshCookie } from "./authentication";

import { store } from "~/redux/store";
import { userLogout, userLogin, authRefreshing } from "~/redux/slices/user";
import { setTabWideAccessStatus } from "~/hooks/useAuthTabWideLogInOutReload";

export interface ApiUser {
  id: number;
  roles: string[];
  permissions: string[];
  firstName?: string;
  lastName?: string;
}

let refreshTimeoutId: ReturnType<typeof setTimeout>;

// TODO: xxx is the autorefresh really needed? Or is it good enough to rely on the refresh by use of the API? 
const refreshToken = () => {
  if (client && !isRefreshing() && getRefreshCookie()) {
    setRefreshing(true);
    client.mutate({
      mutation: authRefreshMutationGQL,
    })
    // TODO: is there a way to get a typed query here?
    .then(({ data }: any) => {
      if (
        data?.authRefresh?.tokens?.access &&
        data?.authRefresh?.tokens?.refresh
      ) {
        const payload = authentication.getTokenPayload(
          data.authRefresh.tokens.access
        );

        if (payload) {
          authentication.setAuthToken(
            data.authRefresh.tokens.access
          );
          authentication.setRefreshCookie(
            data.authRefresh.tokens.refresh
          );

          login(payload.user);
        } else {
          throw new Error("Unable to fetch new access token");
        }
      } else {
        throw new Error("Unable to fetch new access token");
      }
    })
    .catch((error) => {
      console.log(error);
      logout();
    });
  } else if (!isRefreshing) {
    logout();
  }
};

const setRefreshing = (status: boolean) =>
  store.dispatch(authRefreshing(status));

const isRefreshing = () => store.getState().user.refreshing;

const login = (u: ApiUser) => {
  setRefreshing(false);
  setTabWideAccessStatus("logged-in");

  clearTimeout(refreshTimeoutId);
  const token = getAuthToken();

  if (token) {
    refreshTimeoutId = setTimeout(refreshToken, 
      new Date(token.expires).getTime() - Date.now() - 1000)
  }
  
  store.dispatch(userLogin(u));
};

const logout = () => {
  setRefreshing(false);

  if (client) client.clearStore();

  authentication.removeAuthToken();
  authentication.removeRefreshCookie();

  setTabWideAccessStatus("logged-out");
  store.dispatch(userLogout());
};

const defaults = {
  refreshToken,
  login,
  logout,
  setRefreshing,
  isRefreshing
};
export default defaults;
