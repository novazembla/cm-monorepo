import React from "react";
import { applyMiddleware, createStore, compose, StoreEnhancer } from "redux";
import { Provider } from "react-redux";
import { save, load } from "redux-localstorage-simple";

import combinedReduxReducers from "../state/reducers";

import { AppProps } from "../types";

const optionallyUseReduxExtension = (middleware: StoreEnhancer): StoreEnhancer => {
  if (
    typeof window !== "undefined" &&
    ((window as any).__REDUX_DEVTOOLS_EXTENSION__) &&
    typeof ((window as any).__REDUX_DEVTOOLS_EXTENSION__) === "function"
  ) { 
    return compose(
      middleware,
      (window as any).__REDUX_DEVTOOLS_EXTENSION__()
    );
  } else {
    return middleware; 
  }
}

const WrapWithProviders = ({ children }: AppProps) => {
  let middleware = optionallyUseReduxExtension(applyMiddleware(save({ debounce: 500 })));
  let store;

  if (typeof window !== "undefined") {
    store = createStore(combinedReduxReducers, load(), middleware);
  } else {
    store = createStore(combinedReduxReducers);
  }

  return <Provider store={store}>{children}</Provider>;
};

export default WrapWithProviders;
