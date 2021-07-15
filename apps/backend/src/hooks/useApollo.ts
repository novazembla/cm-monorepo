import { useMemo } from "react";
import { ApolloClient } from "@apollo/client";

import { CultureMapSettings } from "../context";
import { apollo } from "../services";

export function useApollo(settings: CultureMapSettings): ApolloClient<any> {
  const client = useMemo(
    () => apollo.initializeClient(settings),
    [settings]
  );
  return client;
}

export default useApollo;
