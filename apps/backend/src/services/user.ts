import { authRefreshMutationGQL } from "@culturemap/core";

import { client } from "./apollo";
import { authentication } from ".";
import { getAuthToken, getRefreshCookie } from "./authentication";

import { store } from "~/redux/store";
import { userLogout, userLogin, authRefreshing } from "~/redux/slices/user";
import { setTabWideAccessStatus } from "~/hooks/useAuthTabWideLogInOutReload";
import { getAppConfig } from "~/config";

const config = getAppConfig();

export interface ApiUser {
  id: number;
  roles: string[];
  permissions: string[];
  firstName?: string;
  lastName?: string;
}

let refreshTimeoutId: ReturnType<typeof setTimeout>;

// TODO: xxx is the autorefresh really needed? Or is it good enough to rely on the refresh by use of the API?
const refreshToken = async () => {
  if (client && !isRefreshing() && getRefreshCookie()) {
    console.log("refresh-1");
  
    setRefreshing(true);
    client
      .mutate({
        fetchPolicy: "no-cache",
        mutation: authRefreshMutationGQL,
        variables: {
          scope: config.scope,
        },
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
            authentication.setAuthToken(data.authRefresh.tokens.access);
            authentication.setRefreshCookie(data.authRefresh.tokens.refresh);

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
    await logout();
  }
};

const setRefreshing = (status: boolean) =>
  store.dispatch(authRefreshing(status));

const isRefreshing = () => store.getState().user.refreshing;

const login = async (u: ApiUser): Promise<boolean> => new Promise((resolve) => {
  setRefreshing(false);
  setTabWideAccessStatus("logged-in");

  clearTimeout(refreshTimeoutId);
  const token = getAuthToken();

  if (token) {
    refreshTimeoutId = setTimeout(
      refreshToken,
      new Date(token.expires).getTime() - Date.now() - 1000
    );
  }

  store.dispatch(
    userLogin({ apiUser: u, expires: getRefreshCookie() })
  );

  resolve(true);
});

const logout = async (): Promise<boolean> => new Promise(async (resolve) => {
  setRefreshing(true);
  authentication.removeAuthToken();
  authentication.removeRefreshCookie();
  
  setTabWideAccessStatus("logged-out");
  
  store.dispatch(userLogout());
  if (client) await client.clearStore();
  setRefreshing(false);

  resolve(true);
});

export const isLocalSessionValid = (): boolean => {
  let sessionOk = false;

  const refreshCookie = authentication.getRefreshCookie();
  if (refreshCookie) {
    try {
      const d = new Date(refreshCookie);
      if (d > new Date())
        sessionOk = true;
    } catch (err) {}
  }
 
  return sessionOk;
};

const defaults = {
  refreshToken,
  login,
  logout,
  setRefreshing,
  isRefreshing,
  isLocalSessionValid,
};
export default defaults;
