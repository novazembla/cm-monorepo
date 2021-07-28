import React from "react";
import ReactDOM from "react-dom";

import "./index.scss";
import App from "./app/app";

import "./i18n";

// TODO: render spinner fallback ...
ReactDOM.render(
  <React.StrictMode>
    <App/>
  </React.StrictMode>,
  document.getElementById("root")
);
