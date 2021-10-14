import React, { Suspense, useEffect, lazy } from "react";
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";

import "@fontsource/raleway/400.css";
import "@fontsource/raleway/700.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";

import AppProviders from "./AppProviders";

import {
  routes,
  privateRoutes,
  publicOnlyRoutes,
  getPrivateRoutesPathsArray,
  getPublicOnlyRoutesPathsArray,
  getRoutesPathsArray,
} from "~/config/routes";

import NotFound from "~/pages/NotFound/NotFound";


import {
  LayoutLight,
  LayoutBlank,
  RoutePrivate,
  RoutePublic,
  RouteHome,
  SettingsLoader,
} from "~/components/app";

import { LoadingIcon } from "~/components/ui";

import { AuthenticationSessionActiveGate } from "~/components/app";
import { useTypedDispatch } from "~/hooks";
import { setPreviousRoute } from "~/redux/slices/router";

const LayoutFull = lazy(() => import("~/components/app/LayoutFull"));
const ScrollToTop = () => {
  const dispatch = useTypedDispatch();

  const { pathname } = useLocation();

  // TODO: suspense plays not so nicely with that,
  useEffect(() => {
    let mounted = true;

    dispatch(setPreviousRoute(pathname));

    if (mounted) {
      console.log("trigger");
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "smooth",
      });
    }
      

    return () => {
      mounted = false;
    };
  }, [pathname, dispatch]);

  return null;
};

const App = () => {
  return (
    <AppProviders>
      <SettingsLoader />
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Navigated to app/dashboard page.{" "}
        {/* TODO: announce change, how is this best done? */}
      </span>
      <Suspense fallback={<LoadingIcon type="light" size={120} />}>
        <BrowserRouter>
          <AuthenticationSessionActiveGate
            publicRoutesPaths={[
              ...getPublicOnlyRoutesPathsArray(),
              ...getRoutesPathsArray(),
            ]}
          >
            <ScrollToTop />
            <Switch>
              <Route exact path="/">
                <RouteHome />
              </Route>

              <Route exact path={getPublicOnlyRoutesPathsArray()}>
                <Suspense fallback={<LoadingIcon type="light" size={120} />}>
                  <LayoutLight>
                    <Switch>
                      {publicOnlyRoutes.map((publicRouteProps) => (
                        <RoutePublic {...publicRouteProps} />
                      ))}
                    </Switch>
                  </LayoutLight>
                </Suspense>
              </Route>

              <Route exact path={getRoutesPathsArray()}>
                <Suspense fallback={<LoadingIcon type="light" size={120} />}>
                  <LayoutLight>
                    <Switch>
                      {routes.map((routeProps) => (
                        <Route {...routeProps} />
                      ))}
                    </Switch>
                  </LayoutLight>
                </Suspense>
              </Route>

              <Route path={getPrivateRoutesPathsArray()}>
                <LayoutFull>
                  <Suspense fallback={<LoadingIcon type="full" size={120} />}>
                    <Switch>
                      {privateRoutes.map((privateRouteProps) => (
                        <RoutePrivate {...privateRouteProps} />
                      ))}
                    </Switch>
                  </Suspense>
                </LayoutFull>
              </Route>

              <Route path="*">
                <LayoutBlank>
                  <Route component={NotFound} />
                </LayoutBlank>
              </Route>
            </Switch>
          </AuthenticationSessionActiveGate>
        </BrowserRouter>
      </Suspense>
    </AppProviders>
  );
};

export default App;
