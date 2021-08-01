import { Route, Redirect } from "react-router-dom";
import { useAuthentication } from "~/hooks";
import type { AppRouteProps } from "~/config/routes";
import { ModulePageAccessDenied } from "~/components/modules";

export const RoutePrivate = (props: AppRouteProps) => {
  const [appUser, { isLoggedIn }] = useAuthentication();
  const { component: Component, ...restProps } = props;

  if (!Component) return null;
  
  if (isLoggedIn()) {
    if (props.userIs && !appUser?.has(props.userIs))
      return <Route {...restProps} component={ModulePageAccessDenied} />;

    if (props.userCan && !appUser?.can(props.userCan))
      return <Route {...restProps} component={ModulePageAccessDenied} />;

    return <Route {...restProps} component={Component} />;
  } else {
    return (
      <Route
        {...restProps}
        render={(routeRenderProps) => (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: routeRenderProps.location },
            }}
          />
        )}
      />
    );
  }
};
