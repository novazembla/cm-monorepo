import React from "react";
import { Provider } from "react-redux";
import { ApolloProvider } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/react";

import { AppProps } from "~/types";

import { useApollo } from "~/hooks";
import { store } from "~/redux/store";

import "@fontsource/raleway/400.css"
import "@fontsource/raleway/700.css"
import "@fontsource/open-sans/400.css"
import "@fontsource/open-sans/400-italic.css"
import "@fontsource/open-sans/700.css"
import "@fontsource/open-sans/700-italic.css"

import {
  CulturemapContextProvider,
  getCulturemapSettings,
} from "~/context/culturemap";

import { chakraTheme } from "~/theme";

const WrapWithProviders = (pageProps: AppProps) => {
  const apolloClient = useApollo(getCulturemapSettings());

  return (
    <CulturemapContextProvider>
      <ApolloProvider client={apolloClient}>
      <ChakraProvider theme={chakraTheme}>
      <Provider store={store}>{pageProps.children}</Provider>
    </ChakraProvider>
        
      </ApolloProvider>
    </CulturemapContextProvider>
  );
};

export default WrapWithProviders;
