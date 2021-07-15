import { BrowserRouter, Route, Switch } from "react-router-dom";

import "./App.css";

import AppProviders from "./AppProviders";

import NotFound from "../pages/NotFound/NotFound";

import LayoutLight from "../components/app/LayoutLight";
import LayoutFull from "../components/app/LayoutFull";

import PrivateRoute from "../components/app/PrivateRoute";
import PublicRoute from "../components/app/PublicRoute";
import { privateRoutes, publicOnlyRoutes } from "./AppRoutes";

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
             <Route exact path={["/", "/profile"]}>
               <LayoutFull>
                 <Switch>
                   {privateRoutes.map((privateRouteProps) => (
                     <PrivateRoute {...privateRouteProps} />
                   ))}
                 </Switch>
               </LayoutFull>
             </Route>

        <Route exact path={["/login", "/register", "/forgot-password"]}>
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
