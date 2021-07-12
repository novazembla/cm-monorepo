import { useState } from "react";
import { decode } from "jsonwebtoken";

import { useAuthToken } from ".";

export interface AuthenticatedUser {
  id: number;
  roles: string[];
  permissions: string[];
}

export const useAuthUser = () => {
  const [getAuthToken, , , , removeAuthToken, removeRefreshToken] = useAuthToken();
  const [storedUser, setUser] = useState<AuthenticatedUser | null>(null);

  const retrieveUser = () => {
    if (!storedUser) {
      
      const authToken = getAuthToken();
  
      if (authToken) {
        if (new Date(authToken.expires).getTime() > Date.now()) {
          const payload = decode(authToken.token, { json: true });
          if (payload?.user?.id && Array.isArray(payload?.user?.roles) && Array.isArray(payload?.user?.permissions))
            setUser(payload.user);  
        } else {
          removeAuthToken();
          setUser(null);
        }        
      }
    }
  };

  const getUser = (): AuthenticatedUser | null => {
    retrieveUser();
    return storedUser;
  };

  const isLoggedIn = (): boolean => {
    retrieveUser();
    return storedUser !== null;
  };

  const login = (user: AuthenticatedUser) => setUser(user);

  const logout = () => {
    removeAuthToken();
    removeRefreshToken();
    setUser(null);
  };

  return [isLoggedIn, getUser, login, logout] as const;
};
