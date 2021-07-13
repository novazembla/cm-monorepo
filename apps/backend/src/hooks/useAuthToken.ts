import Cookies, { CookieSetOptions } from "universal-cookie";
import { decode, JwtPayload } from "jsonwebtoken";

import { AuthenticatedUser } from "./useAuthUser";

export const HAS_RERESH_COOKIE_NAME = "authRefresh";
export const REFRES_TIMEOUT_COOKIE_NAME = "authRefreshTimeout";

export interface Token {
  token: string;
  expires: string;
}

export interface TokenPayload extends JwtPayload {
  exp: number;
  iat: number;
  type: string;
  user: AuthenticatedUser;
}

let authToken: Token | null = null;

const cookies = new Cookies();

const options: CookieSetOptions = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

// custom hook to handle authToken - we use compositon to decouple the auth system and it's storage
export const useAuthToken = () => {
  const getAuthToken = (): Token | null => authToken;

  const getTokenPayload = (token: Token): TokenPayload | null => {
    if (!token) return null;

    try {
      if (new Date(token.expires).getTime() > Date.now()) {
        
        const payload = decode(token.token, { json: true });
        
        if (!payload)
          return null;
        
        if (payload.exp && payload.exp * 1000 < Date.now())
          return null;
        
        if (
          !payload.user ||
          !payload.user.id ||
          !Array.isArray(payload.user.roles) ||
          !Array.isArray(payload.user.permissions)
        )
          return null;
        
        return payload as TokenPayload;
      }
    } catch (Err) {
      console.error(Err);
    }

    return null;
  };

  const setAuthToken = (token: Token): void => {
    authToken = token;
    cookies.set(REFRES_TIMEOUT_COOKIE_NAME, "active", {
      ...options,
      ...{ expires: new Date(token.expires) },
    });
  };

  const getRefreshCookie = (): string => cookies.get(HAS_RERESH_COOKIE_NAME);

  const setRefreshCookie = (token: Token) => {
    cookies.set(HAS_RERESH_COOKIE_NAME, "active", {
      ...options,
      ...{ expires: new Date(token.expires) },
    });
  };

  const removeAuthToken = () => {
    authToken = null;
    cookies.remove(REFRES_TIMEOUT_COOKIE_NAME, options);
  };

  const removeRefreshCookie = () => {
    cookies.remove(HAS_RERESH_COOKIE_NAME, options);
  };

  return [
    getAuthToken,
    getTokenPayload,
    setAuthToken,
    getRefreshCookie,
    setRefreshCookie,
    removeAuthToken,
    removeRefreshCookie,
  ] as const;
};

export default useAuthToken;
