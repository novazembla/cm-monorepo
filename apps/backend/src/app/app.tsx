import React, { Suspense, useEffect } from "react";
import { BrowserRouter, Route, Switch, useLocation } from "react-router-dom";
import { Flex } from "@chakra-ui/react";

import "./App.scss";

import AppProviders from "./AppProviders";

import NotFound from "~/pages/NotFound/NotFound";

import {
  LayoutLight,
  LayoutBlank,
  LayoutFull,
  RoutePrivate,
  RoutePublic,
  RouteHome,
} from "~/components/app";

import {
  routes,
  privateRoutes,
  publicOnlyRoutes,
  getPrivateRoutesPathsArray,
  getPublicOnlyRoutesPathsArray,
  getRoutesPathsArray,
} from "~/config/routes";

import { PageLoading } from "~/components/ui";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  // TODO: suspense plays not so nicely with that, 
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [pathname]);

  return null;
};

const App = () => {
  return (
    <AppProviders>
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Navigated to app/dashboard page.{" "}
        {/* TODO: announce change, how is this best done? */}
      </span>

      <Suspense
        fallback={
          <Flex w="100" h="100%" justify="center" alignItems="center">
            <PageLoading />
          </Flex>
        }
      >
        <BrowserRouter>
          <ScrollToTop />
          <Switch>
            <Route exact path="/">
              <RouteHome />
            </Route>

            <Route exact path={getPublicOnlyRoutesPathsArray()}>
              <LayoutLight>
                <Switch>
                  {publicOnlyRoutes.map((publicRouteProps) => (
                    <RoutePublic {...publicRouteProps} />
                  ))}
                </Switch>
              </LayoutLight>
            </Route>

            <Route exact path={getRoutesPathsArray()}>
              <LayoutLight>
                <Switch>
                  {routes.map((routeProps) => (
                    <Route {...routeProps} />
                  ))}
                </Switch>
              </LayoutLight>
            </Route>

            <Route path={getPrivateRoutesPathsArray()}>
              <LayoutFull>
                <Switch>
                  {privateRoutes.map((privateRouteProps) => (
                    <RoutePrivate {...privateRouteProps} />
                  ))}
                </Switch>
              </LayoutFull>
            </Route>

            <Route path="*">
              <LayoutBlank>
                <Route component={NotFound} />
              </LayoutBlank>
            </Route>
          </Switch>
        </BrowserRouter>
      </Suspense>
    </AppProviders>
  );
};

export default App;
