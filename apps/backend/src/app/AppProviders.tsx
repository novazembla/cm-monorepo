import React from "react";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";

import { store } from "~/redux/store";

import "@fontsource/raleway/400.css";
import "@fontsource/raleway/700.css";
import "@fontsource/open-sans/400.css";
import "@fontsource/open-sans/400-italic.css";
import "@fontsource/open-sans/700.css";
import "@fontsource/open-sans/700-italic.css";

import { ConfigContextProvider, AppApolloProvider } from "~/provider";

import { chakraTheme } from "~/theme";

const WrapWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigContextProvider>
      <ChakraProvider theme={chakraTheme}>
        <Provider store={store}>
          <AppApolloProvider>{children}</AppApolloProvider>
        </Provider>
      </ChakraProvider>
    </ConfigContextProvider>
  );
};

export default WrapWithProviders;
