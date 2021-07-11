import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isLoggedIn } from "axios-jwt";

type CompontentProps = {
  component: React.FC;
};

export const PublicRoute = (props: CompontentProps) => {
  const { component: Component, ...restProps } = props;

  if (!Component) return null;

  console.log(Component);
  
  return !isLoggedIn() ? (
    <Route component={Component} />
  ) : (
    <Route
      {...restProps}
      render={(routeRenderProps) => (
        <Redirect
          to={{
            pathname: "/",
            state: { from: routeRenderProps.location },
          }}
        />
      )}
    />
  );
};
export default PublicRoute;
