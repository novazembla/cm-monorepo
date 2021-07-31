import Cookies, { CookieSetOptions } from "universal-cookie";
import { decode, JwtPayload } from "jsonwebtoken";

import { ApiUser } from "./user";

export const HAS_REFRESH_COOKIE_NAME = "authRefresh";

export interface Token {
  token: string;
  expires: string;
}

export interface TokenPayload extends JwtPayload {
  exp: number;
  iat: number;
  type: string;
  user: ApiUser;
}

let authToken: Token | null = null;

const cookies = new Cookies();

const options: CookieSetOptions = {
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  expires: new Date("1970-01-01"),
};

export const getAuthToken = (): Token | null => authToken;

export const getRefreshCookie = (): string =>
  cookies.get(HAS_REFRESH_COOKIE_NAME);

export const getTokenPayload = (token: Token): TokenPayload | null => {
  if (!token) return null;

  try {
    if (new Date(token.expires).getTime() > Date.now()) {
      const payload = decode(token.token, { json: true });

      if (!payload) return null;

      if (payload.exp && payload.exp * 1000 < Date.now()) return null;

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

export const removeAuthToken = () => {
  authToken = null;
};

export const removeRefreshCookie = () => {
  cookies.remove(HAS_REFRESH_COOKIE_NAME, options);
};

export const setAuthToken = (token: Token): void => {
  authToken = token;
};

export const setRefreshCookie = (token: Token) => {
  cookies.set(HAS_REFRESH_COOKIE_NAME, token.expires, {
    ...options,
    ...{ expires: new Date(token.expires) },
  });
};

export const authentication = {
  getAuthToken,
  getRefreshCookie,
  setAuthToken,
  setRefreshCookie,
  removeRefreshCookie,
  removeAuthToken,
  getTokenPayload,
};

export default authentication
