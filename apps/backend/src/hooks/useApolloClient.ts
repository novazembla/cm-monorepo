import { useMemo } from "react";
import { ApolloClient } from "@apollo/client";
import { initializeClient } from "~/services/apollo";
import { useConfig } from ".";

export function useApolloClient(): ApolloClient<any> {
  const config = useConfig();
  const client = useMemo(() => initializeClient(config), [config]);
  return client;
}

export default useApolloClient;
