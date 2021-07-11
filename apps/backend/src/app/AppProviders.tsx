import React from "react";
import { applyMiddleware, createStore, compose, StoreEnhancer } from "redux";
import { Provider } from "react-redux";
import { save, load } from "redux-localstorage-simple";
import { ApolloProvider } from "@apollo/client";

import combinedReduxReducers from "../state/reducers";

import { AppProps } from "../types";

import { useApollo } from "../services/apolloClient";
import {
  CulturemapContextProvider,
  getCulturemapSettings,
} from "../context/culturemap";

const optionallyUseReduxExtension = (
  middleware: StoreEnhancer
): StoreEnhancer => {
  if (
    typeof window !== "undefined" &&
    (window as any).__REDUX_DEVTOOLS_EXTENSION__ &&
    typeof (window as any).__REDUX_DEVTOOLS_EXTENSION__ === "function"
  ) {
    return compose(middleware, (window as any).__REDUX_DEVTOOLS_EXTENSION__());
  } else {
    return middleware;
  }
};

const WrapWithProviders = (pageProps: AppProps) => {
  const apolloClient = useApollo(pageProps, getCulturemapSettings());

  let middleware = optionallyUseReduxExtension(
    applyMiddleware(save({ debounce: 500 }))
  );
  let store;

  if (typeof window !== "undefined") {
    store = createStore(combinedReduxReducers, load(), middleware);
  } else {
    store = createStore(combinedReduxReducers);
  }

  return (
    <CulturemapContextProvider>
      <ApolloProvider client={apolloClient}>
        <Provider store={store}>{pageProps.children}</Provider>
      </ApolloProvider>
    </CulturemapContextProvider>
  );
};

export default WrapWithProviders;
