import React from "react";
import { Route, Redirect } from "react-router-dom";
import { isLoggedIn } from "axios-jwt";

type CompontentProps = {
  component: React.FC;
};

const PrivateRoute = (props: CompontentProps) => {
  console.log(props);
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
