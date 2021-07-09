import React from "react";
import { ApolloProvider } from "@apollo/client";

import "../styles/globals.css";
import type { AppProps } from "next/app";
import {
  CulturemapContextProvider,
  getCulturemapSettings,
} from "../context/culturemap";
import { useApollo } from "../lib/apolloClient";

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps, getCulturemapSettings());

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <CulturemapContextProvider>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </CulturemapContextProvider>
  );
}
export default MyApp;
