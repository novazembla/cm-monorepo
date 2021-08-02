import React from "react";
import { ApolloProvider } from "@apollo/client";

import { useApolloClient } from "~/hooks";

export const AppApolloProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloClient = useApolloClient();

  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
};
