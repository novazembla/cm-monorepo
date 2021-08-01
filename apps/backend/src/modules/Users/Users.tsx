import { Route, Switch} from "react-router-dom";
import { moduleRoutes, getModuleRoutesPathsArray } from "./routes";
import { RoutePrivate } from "~/components/app";

import ModulePageNotFound from "~/components/modules/ModulePageNotFound";

const Users = () => {
  return (
    <>
        <Switch>
          <Route exact path={getModuleRoutesPathsArray()}>
            <Switch>
              {moduleRoutes.map((routeProps) => (<RoutePrivate {...routeProps} />))}
            </Switch>
          </Route>
          <Route path="*" component={ModulePageNotFound} />
        </Switch>
    </>
  );
};
export default Users;
