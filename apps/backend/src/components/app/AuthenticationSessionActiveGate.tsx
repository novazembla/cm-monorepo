import React, { useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";

import { user } from "~/services";

export const AuthenticationSessionActiveGate = ({
  children,
  publicRoutesPaths,
}: {
  children: React.ReactNode;
  publicRoutesPaths: string[];
}) => {
  const history = useHistory();
  const { pathname } = useLocation();

  useEffect(() => {
    const processLogout = async () => {
      console.log("logout() AuthGate");
      await user.logout();
    };

    const refreshToken = async () => {
      await user.refreshToken();
    };

    if (!user.isLocalSessionValid()) {
      processLogout();

      if (!publicRoutesPaths.includes(pathname.endsWith('/') ? pathname.slice(0, -1) : pathname)) history.push("/login");
    } else {
      refreshToken();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};
