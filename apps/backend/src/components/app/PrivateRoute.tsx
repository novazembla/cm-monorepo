import React from "react";
import { Route, Redirect } from "react-router-dom";

type CompontentProps = {
  component: React.FC;
};

const isLoggedIn = () => false; // TODO: fix

const PrivateRoute = (props: CompontentProps) => {
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

  // return (
  //   <Route
  //     {...restProps}
  //     render={(routeRenderProps) =>
  //       isLoggedIn() ? (
  //         <Component {...routeRenderProps} />
  //       ) : (
  //         <Redirect
  //           to={{
  //             pathname: "/login",
  //             state: { from: routeRenderProps.location },
  //           }}
  //         />
  //       )
  //     }
  //   />
  // );
};

export default PrivateRoute;
