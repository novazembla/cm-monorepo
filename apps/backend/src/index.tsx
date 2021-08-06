import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import App from "./app/App";

import "./i18n";

ReactDOM.render(
  //<App/>,
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById("root")
);
