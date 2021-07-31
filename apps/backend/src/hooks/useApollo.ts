import { useMemo } from "react";
import { ApolloClient } from "@apollo/client";

import { AppConfig } from "~/config";
import { apollo } from "~/services";

export function useApollo(settings: AppConfig): ApolloClient<any> {
  const client = useMemo(
    () => apollo.initializeClient(settings),
    [settings]
  );
  return client;
}

export default useApollo;
