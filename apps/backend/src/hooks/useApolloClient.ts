import { useMemo } from "react";
import { ApolloClient } from "@apollo/client";
import { apollo } from "~/services";
import { useConfig } from ".";

export function useApolloClient(): ApolloClient<any> {
  const config = useConfig();
  const client = useMemo(() => apollo.initializeClient(config), [config]);
  return client;
}

export default useApolloClient;
