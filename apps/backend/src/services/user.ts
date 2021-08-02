import { authRefreshMutationGQL } from "@culturemap/core";
import type { AuthenticatedAppUserData } from "@culturemap/core"

import { client } from "./apollo";
import { authentication } from ".";
import { getAuthToken, getRefreshCookie } from "./authentication";

import { store } from "~/redux/store";
import { userLogout, userLogin, authRefreshing, authAllowRefresh } from "~/redux/slices/user";
import { setTabWideAccessStatus } from "~/hooks/useAuthTabWideLogInOutReload";
import { getAppConfig } from "~/config";

const config = getAppConfig();

let refreshTimeoutId: ReturnType<typeof setTimeout>;

// TODO: xxx is the autorefresh really needed? Or is it good enough to rely on the refresh by use of the API?
const refreshToken = async () => {
  if (client && canRefresh() && getRefreshCookie()) {
    setAllowRefresh(false);
    setRefreshing(true);
    console.log("Triggering refreshToken via timeOut");

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
  } else if (canRefresh()) {
    await logout();
  }
};

const setAllowRefresh = (status: boolean) =>
  store.dispatch(authAllowRefresh(status));

const canRefresh = () => store.getState().user.allowRefresh;

const setRefreshing = (status: boolean) =>
  store.dispatch(authRefreshing(status));

const isRefreshing = () => store.getState().user.refreshing;

const login = async (u: AuthenticatedAppUserData): Promise<boolean> => new Promise((resolve) => {
  setRefreshing(false);
  setTabWideAccessStatus("logged-in");

  clearTimeout(refreshTimeoutId);
  const token = getAuthToken();

  if (token) {
    refreshTimeoutId = setTimeout(
      refreshToken,
      new Date(token.expires).getTime() - Date.now() - 10000
    );
  }
  store.dispatch(
    userLogin({ appUserData: u, expires: getRefreshCookie() })
  );

  resolve(true);
});

const logout = async (): Promise<boolean> => new Promise(async (resolve) => {
  setRefreshing(false);
  authentication.removeAuthToken();
  authentication.removeRefreshCookie();
  
  store.dispatch(userLogout());

  // we're using resetStore (as clearStore cancels all ongoing queries)
  if (client) await client.resetStore();
  
  setTabWideAccessStatus("logged-out");
  
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
  canRefresh,
  setAllowRefresh,
  isLocalSessionValid,
};
export default defaults;
