import {
  from,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import { authentication, user } from ".";
import type { AuthenticatedUser } from "./user";
import { CultureMapSettings } from "../context";

export let client: ApolloClient<any> | null = null;

const authLink = new ApolloLink((operation, forward) => {
  // retrieve access token from memory
  const accessToken = authentication.getAuthToken();

  if (accessToken) {
    operation.setContext({
      headers: {
        authorization: `Bearer ${accessToken.token}`,
      },
    });
  }

  // Call the next link in the middleware chain.
  return forward(operation);
});

// Log any GraphQL errors or network error that occurred
const errorLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      graphQLErrors.map(({ message, locations, path }) =>
        console.log(
          `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
        )
      );
      
      let retryLogin = false;
      for (let err of graphQLErrors) {
        console.log("Error", err?.extensions?.code);

        switch (err?.extensions?.code) {
          case "UNAUTHENTICATED":
            retryLogin = true;
            break;
        }
      }

      if (retryLogin) {
        user.refreshAccessToken(
          (u: AuthenticatedUser) => {
            user.setRefreshing(false);
            user.set(u);
          },
          () => {
            user.setRefreshing(false);
            user.set(null);
            authentication.removeAuthToken();
            authentication.removeRefreshCookie();
            
            if (client)
              client.clearStore();
          }
        );

        const accessToken = authentication.getAuthToken();

        if (accessToken) {
          const oldHeaders = operation.getContext().headers;
          // modify the operation context with a new token
          operation.setContext({
            headers: {
              ...oldHeaders,
              authorization: `Bearer ${accessToken}`,
            },
          });
          return forward(operation);
        }
      }
    }

    if (networkError) console.log(`[Network error]: ${networkError}`);
  }
);

const createApolloClient = (settings: CultureMapSettings) => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([
      authLink,
      new RetryLink({
        delay: {
          initial: 300,
          max: 20000,
          jitter: true,
        },
        attempts: {
          max: 5,
          retryIf: (error, _operation) => !!error,
        },
      }),
      errorLink,
      new HttpLink({
        uri: settings.apiUrl, // Server URL (must be absolute)
        credentials: "include", // Additional fetch() options like `credentials` or `headers`
      }),
    ]),
    // TODO: find generic ways to manage the chache ...
    // HOW TO ENSURE deletion/updates are reflected in the cache ...
    // how will the cache expire?
    cache: new InMemoryCache({
      // typePolicies: {
      //   Query: {
      //     fields: {
      //       allPosts: concatPagination(), // TODO: adjust to useful results ..., not working ... https://github.com/apollographql/apollo-client/issues/6679
      //     },
      //   },
      // },
    }),
  });
};

export const initializeClient = (settings: CultureMapSettings) => {
  const aClient = client ?? createApolloClient(settings);

  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return aClient;
  // Create the Apollo Client once in the client
  if (!client) client = aClient;

  return aClient;
};

const defaults = {
  client,
  initializeClient,
};

export default defaults;
