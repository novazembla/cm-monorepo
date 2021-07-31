import React from "react";
import { ApolloProvider } from "@apollo/client";

import "../styles/globals.css";
import type { AppProps } from "next/app";

import { ConfigContextProvider } from "~/provider";
import { getAppConfig } from "~/config";
import { useApollo } from "~/lib/apolloClient";

function MyApp({ Component, pageProps }: AppProps) {
  const apolloClient = useApollo(pageProps, getAppConfig());

  /* eslint-disable react/jsx-props-no-spreading */
  return (
    <ConfigContextProvider>
      <ApolloProvider client={apolloClient}>
        <Component {...pageProps} />
      </ApolloProvider>
    </ConfigContextProvider>
  );
}
export default MyApp;
