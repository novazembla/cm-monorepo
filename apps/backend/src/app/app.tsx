import { BrowserRouter, Route, Switch } from "react-router-dom";

import "./App.css";

import AppProviders from "./AppProviders";

import NotFound from "../pages/NotFound/NotFound";

import LayoutLight from "../components/app/LayoutLight";
import LayoutFull from "../components/app/LayoutFull";

import PrivateRoute from "../components/app/PrivateRoute";
import PublicRoute from "../components/app/PublicRoute";
import { routes, privateRoutes, publicOnlyRoutes, getPrivateRoutesPathsArray, getPublicOnlyRoutesPathsArray, getRoutesPathsArray } from "../config/routes";

import { Windmill } from "@windmill/react-ui";
import windmillTheme from "../theme";


const App = () => {
  return <Windmill theme={windmillTheme}>
      <AppProviders>
      <span
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        Navigated to app/dashboard page.
      </span>
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
            <LayoutLight>
              <Switch>
                <Route component={NotFound} />
              </Switch>
            </LayoutLight>
          </Route>
        </Switch>
      </BrowserRouter>
    </AppProviders>
  </Windmill>;
};

export default App;
