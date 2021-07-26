// import React from "react";
// import ReactDOM from "react-dom";
// import { ChakraProvider, extendTheme } from "@chakra-ui/react";

// import "./index.scss";
// import App from "./app/app";

// import "./i18n";
// import { chackraTheme } from "~/theme";


// console.log(chackraTheme);

// // TODO: render spinner fallback ...
// ReactDOM.render(
//   <React.StrictMode>
//     <ChakraProvider theme={extendTheme(chackraTheme)}>
//       <App />
//     </ChakraProvider>
//   </React.StrictMode>,
//   document.getElementById("root")
// );

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
