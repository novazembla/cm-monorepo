import React from "react";
import { Provider } from "react-redux";
import { ChakraProvider } from "@chakra-ui/react";
import { ThemeProvider } from "styled-components";
import { store } from "~/redux/store";

import { ConfigContextProvider, AppApolloProvider } from "~/provider";

import { chakraTheme, styledComponentsTheme } from "~/theme";

const WrapWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConfigContextProvider>
      <ChakraProvider theme={chakraTheme}>
        <ThemeProvider theme={styledComponentsTheme}>
          <Provider store={store}>
            <AppApolloProvider>{children}</AppApolloProvider>
          </Provider>
        </ThemeProvider>
      </ChakraProvider>
    </ConfigContextProvider>
  );
};

export default WrapWithProviders;
