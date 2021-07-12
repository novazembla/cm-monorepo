import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useAuthUser } from "../../hooks";

type CompontentProps = {
  component: React.FC;
};

const PrivateRoute = (props: CompontentProps) => {
  const [isLoggedIn,] = useAuthUser();
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

  // TODO: what's that? return (
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
