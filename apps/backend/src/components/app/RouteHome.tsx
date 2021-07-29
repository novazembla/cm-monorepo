import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthentication } from "~/hooks";


export const RouteHome = () => {
  const [, { isLoggedIn } ] = useAuthentication();
  
  return <Route
      render={(routeRenderProps) => (
        <Redirect
          to={{
            pathname: isLoggedIn() ? "/dashboard" : "/login",
            state: { from: routeRenderProps.location },
          }}
        />
      )}
    />
};