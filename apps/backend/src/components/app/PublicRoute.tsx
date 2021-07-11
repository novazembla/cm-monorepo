import React from "react";
import { Route, Redirect } from "react-router-dom";

type CompontentProps = {
  component: React.FC;
};

const isLoggedIn = () => false; // TODO: fix

export const PublicRoute = (props: CompontentProps) => {
  const { component: Component, ...restProps } = props;

  if (!Component) return null;
  
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
