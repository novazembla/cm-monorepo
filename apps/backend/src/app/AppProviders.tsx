import React from "react";
import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";

import { AppProps } from "../types";

import { useApollo } from "../hooks";
import { store } from "../redux/store";

import {
  CulturemapContextProvider,
  getCulturemapSettings,
} from "../context/culturemap";

const WrapWithProviders = (pageProps: AppProps) => {
  const apolloClient = useApollo(getCulturemapSettings());

  return (
    <CulturemapContextProvider>
      <ApolloProvider client={apolloClient}>
        <Provider store={store}>{pageProps.children}</Provider>
      </ApolloProvider>
    </CulturemapContextProvider>
  );
};

export default WrapWithProviders;
