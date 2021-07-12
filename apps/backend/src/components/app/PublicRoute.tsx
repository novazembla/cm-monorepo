import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthUser } from "../../hooks";

type CompontentProps = {
  component: React.FC;
};

export const PublicRoute = (props: CompontentProps) => {
  const [isLoggedIn, ] = useAuthUser();
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
