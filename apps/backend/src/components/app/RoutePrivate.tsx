import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthentication } from "~/hooks";

type CompontentProps = {
  component: React.FC;
};

export const RoutePrivate = (props: CompontentProps) => {
  const [, { isLoggedIn }] = useAuthentication();
  const { component: Component, ...restProps } = props;

  if (!Component) return null;
  
  return isLoggedIn() ? (
    <Route {...restProps} component={Component} />
  ) : (
    <Route
      {...restProps}
      render={(routeRenderProps) =>
        <Redirect
          to={{
            pathname: "/login",
            state: { from: routeRenderProps.location },
          }}
        />
      }
    />
  );
};
