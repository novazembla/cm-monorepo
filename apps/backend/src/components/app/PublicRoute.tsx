import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthentication } from "~/hooks";

type CompontentProps = {
  component: React.FC;
};

export const PublicRoute = (props: CompontentProps) => {
  const [, { isLoggedIn } ] = useAuthentication();
  const { component: Component, ...restProps } = props;

  if (!Component) return null;
  
  return !isLoggedIn() ? (
    <Route {...restProps} component={Component} />
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
