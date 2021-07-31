import React from 'react'
import { ApolloProvider } from "@apollo/client";

import {
  useApollo, useConfig
} from "~/hooks"

export const AppApolloProvider = ({children}:{children:React.ReactNode}) => {
  const config = useConfig();
  const apolloClient = useApollo(config);

  return (
    <ApolloProvider client={apolloClient}>{children}</ApolloProvider>
  )
}
