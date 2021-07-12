import Cookies, { CookieSetOptions} from 'universal-cookie';

export const ACCESS_TOKEN_NAME = "authToken";
export const REFRESH_TOKEN_NAME = "refreshToken";

export interface Token {
  token: string;
  expires: string;
}

const cookies = new Cookies();

const options: CookieSetOptions = {
  sameSite: "strict",
  secure: process.env.NODE_ENV === "production",
  path: '/', 
};

// custom hook to handle authToken - we use compositon to decouple the auth system and it's storage
export const useAuthToken = () => {
  
  const getAuthToken = (): Token => cookies.get(ACCESS_TOKEN_NAME);

  const setAuthToken = (token: Token) => {
    cookies.set(ACCESS_TOKEN_NAME, token, {
      ...options,
      ...{ maxAge: new Date(token.expires).getTime() - new Date().getTime() },
    });
  };

  const getRefreshToken = (): Token => cookies.get(REFRESH_TOKEN_NAME);;

  const setRefreshToken = (token: Token) => {
    // should I deal with HTTP only?, TODO: max age ... 
    cookies.set(REFRESH_TOKEN_NAME, token, {
      ...options,
      ...{ maxAge: new Date(token.expires).getTime() - new Date().getTime() },
    });
  };

  const removeAuthToken = () => {
    cookies.remove(ACCESS_TOKEN_NAME, options);
  };

  const removeRefresh = () => {
    cookies.remove(REFRESH_TOKEN_NAME, options);
  };

  return [
    getAuthToken,
    setAuthToken,
    getRefreshToken,
    setRefreshToken,
    removeAuthToken,
    removeRefresh,
  ] as const;
};

export default useAuthToken;
