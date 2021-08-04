import React, {useEffect} from "react";
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


  useEffect(() => {
    const processLogout = async () => {
      console.log("logout() AuthGate");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  
  return <>{children}</>;
};
