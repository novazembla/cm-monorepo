import React from "react";
import { ApolloProvider } from "@apollo/client";

import "../styles/globals.css";
import type { AppProps } from "next/app";

import { useApollo } from "../lib/apolloClient";

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps, {});

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ApolloProvider client={apolloClient}>
      <Component {...pageProps} />
    </ApolloProvider>
  );
}
export default MyApp;
