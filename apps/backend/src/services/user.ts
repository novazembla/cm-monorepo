import { userRefreshMutationGQL } from "@culturemap/core";

import { client } from "./apollo";
import { authentication } from ".";
import { getAuthToken, getRefreshCookie } from "./authentication";

import { store } from "../redux/store";
import { userLogout, userLogin, userRefreshing } from "../redux/slices/user";
import { setTabWideAccessStatus } from "../hooks/useAuthTabWideLogInOutReload";

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
  console.log('triggered auto user refresh');
  if (client && !isRefreshing() && getRefreshCookie()) {
    setRefreshing(true);
    client.mutate({
      mutation: userRefreshMutationGQL,
    })
    // TODO: is there a way to get a typed query here?
    .then(({ data }: any) => {
      console.log(data);
      if (
        data?.userRefresh?.tokens?.access &&
        data?.userRefresh?.tokens?.refresh
      ) {
        const payload = authentication.getTokenPayload(
          data.userRefresh.tokens.access
        );

        if (payload) {
          authentication.setAuthToken(
            data.userRefresh.tokens.access
          );
          authentication.setRefreshCookie(
            data.userRefresh.tokens.refresh
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
  store.dispatch(userRefreshing(status));

const isRefreshing = () => store.getState().user.refreshing;

const login = (u: ApiUser) => {
  console.log("login user");
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
  console.log("logout user");
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
