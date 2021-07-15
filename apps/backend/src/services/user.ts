import { userRefreshMutationGQL } from "@culturemap/core";

import { client } from "./apollo";
import { authentication } from ".";
import { Token } from "./authentication";

import { store } from "../redux/store";
import { authLogout, authLogin } from "../redux/slices/authentication";
import { setTabWideAccessInfo } from "../hooks/useAuthTabWideLogout";

export interface AuthenticatedUser {
  id: number;
  roles: string[];
  permissions: string[];
}

let user: AuthenticatedUser | null = null;
let refreshing = false;
// let currentPath = "/"; TODO: needed 

export const refreshAccessToken = async (
  onSuccess?: Function | undefined,
  onFail?: Function | undefined
) => {
  if (client) {
    await client
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
            authentication.setRefreshCookie(data.userRefresh.tokens.refresh);

            if (onSuccess) onSuccess.apply(this, [payload.user]);
          } else {
            if (onFail) onFail.call(this);
          }
        } else {
          if (onFail) onFail.call(this);
        }
      })
      .catch(() => {
        if (onFail) onFail.call(this);
      });
  } else {
    if (onFail) onFail.call(this);
  }
};


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

        // if (typeof window !== "undefined") TODO: needed
        //   currentPath = window.location.pathname;

        refreshAccessToken((u: AuthenticatedUser) => {
          login(u);


          // history.push(currentPath); TODO: needed
        }, logout);
      }
    }
  }
};

const set = (u: AuthenticatedUser | null) => (user = u);

const get = (): AuthenticatedUser | null => {
  retrieveUser();
  return user;
};

const setRefreshing = (status: boolean) => refreshing = status;
const isRefreshing = () => refreshing;

const login = (u: AuthenticatedUser) => {
  setRefreshing(false);
  set(u);
  store.dispatch(authLogin());
  setTabWideAccessInfo("logged-in");
}

const logout = () => {
  setRefreshing(false); 
  set(null);
  
  if (client)
    client.clearStore();
  
  authentication.removeAuthToken();
  authentication.removeRefreshCookie();
  
  store.dispatch(authLogout());
  setTabWideAccessInfo("logged-out");
}

const defaults = {
  login,
  logout,
  set,
  get,
  setRefreshing,
  isRefreshing,
  refreshAccessToken,
};
export default defaults;
