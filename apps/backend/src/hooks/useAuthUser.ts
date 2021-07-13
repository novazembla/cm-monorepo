import { useDispatch, useSelector } from "react-redux";
import { useAuthToken } from ".";
import { ReduxRootState } from "../state/reducers";
import { useApolloClient } from "@apollo/client";

export interface AuthenticatedUser {
  id: number;
  roles: string[];
  permissions: string[];
}

export const useAuthUser = () => {
  const [, , , getRefreshCookie, , removeAuthToken, removeRefreshCookie] = useAuthToken();
  const { user } = useSelector( ( { auth }: ReduxRootState ) => auth )
  const client = useApolloClient();
  const dispatch = useDispatch();

  const retrieveUser = () => {
    if (!user) {
      console.log("User is not known");
      
      const refreshCookie = getRefreshCookie();

      if (refreshCookie === "active") {
        
        console.log("!current should attempt to refresh");
      } else {
        removeRefreshCookie();
        removeAuthToken();
      }
      
    } else {
      console.log("user stored", user)
    }
  };

  const getUser = (): AuthenticatedUser | null => { 
    retrieveUser();
    return user;
  };

  const isLoggedIn = (): boolean => {
    retrieveUser();
    return user !== null;
  };

  const login = (justLoggedInUser: AuthenticatedUser) => {
    dispatch({type:"auth.login", payload: {user: justLoggedInUser}});
  }

  const logout = () => {
    client.clearStore();
    removeAuthToken();
    removeRefreshCookie();
    dispatch({type:"auth.logout"});
  };

  return [isLoggedIn, getUser, login, logout] as const;
};
