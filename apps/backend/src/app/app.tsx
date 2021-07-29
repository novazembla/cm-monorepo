import React, { Suspense } from "react";
import { BrowserRouter, Route, Switch } from "react-router-dom";
import { Flex } from "@chakra-ui/react"

import "./App.scss";

import AppProviders from "./AppProviders";

import NotFound from "~/pages/NotFound/NotFound";

import { LayoutLight, LayoutBlank, LayoutFull, PrivateRoute, PublicRoute } from "~/components/app";

import {
  routes,
  privateRoutes,
  publicOnlyRoutes,
  getPrivateRoutesPathsArray,
  getPublicOnlyRoutesPathsArray,
  getRoutesPathsArray,
} from "~/config/routes";


import { PageLoading } from "~/components/ui";

const App = () => {
  return (
    <AppProviders>
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Navigated to app/dashboard page.
      </span>
      
      <Suspense fallback={<Flex w="100" h="100%" justify="center" alignItems="center"><PageLoading/></Flex>}>
        <BrowserRouter>
          <Switch>
            <Route exact path={getRoutesPathsArray()}>
              <LayoutLight>
                <Switch>
                  {routes.map((routeProps) => (
                    <Route {...routeProps} />
                  ))}
                </Switch>
              </LayoutLight>
            </Route>

            <Route exact path={getPrivateRoutesPathsArray()}>
              <LayoutFull>
                <Switch>
                  {privateRoutes.map((privateRouteProps) => (
                    <PrivateRoute {...privateRouteProps} />
                  ))}
                </Switch>
              </LayoutFull>
            </Route>

            <Route exact path={getPublicOnlyRoutesPathsArray()}>
              <LayoutLight>
                <Switch>
                  {publicOnlyRoutes.map((publicRouteProps) => (
                    <PublicRoute {...publicRouteProps} />
                  ))}
                </Switch>
              </LayoutLight>
            </Route>

            <Route path="*">
              <LayoutBlank>
                <Switch>
                  <Route component={NotFound} />
                </Switch>
              </LayoutBlank>
            </Route>
          </Switch>
        </BrowserRouter>
      </Suspense>
    </AppProviders>
  );
};

export default App;
