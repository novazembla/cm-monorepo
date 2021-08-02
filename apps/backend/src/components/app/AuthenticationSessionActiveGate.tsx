import React from "react";
import { useHistory, useLocation } from "react-router-dom";

import { user } from "~/services";

export const AuthenticationSessionActiveGate = ({
  children,
  publicRoutesPaths
}: {
  children: React.ReactNode;
  publicRoutesPaths: string[]
}) => {
  const history = useHistory();
  const {pathname} = useLocation();

  const processLogout = async () => {
    await user.logout();
  };

  if (!user.isLocalSessionValid()) {
    processLogout();
    
    if (!publicRoutesPaths.includes(pathname))
      history.push("/login");
  } else {
    user.setAllowRefresh(true);
    user.setRefreshing(false);
  }
  return <>{children}</>;
};

export default AuthenticationSessionActiveGate;
