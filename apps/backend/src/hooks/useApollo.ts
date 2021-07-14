import { useMemo } from "react";
import {
  from,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink
} from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import { concatPagination } from "@apollo/client/utilities";

import merge from "deepmerge";
import isEqual from "lodash/isEqual";
import { CultureMapSettings } from "../context";

import { authentication } from "../services";
import { useAuthentication, AuthenticatedUser } from ".";

export const APOLLO_STATE_PROP_NAME = "__APOLLO_STATE__";
let apolloClient: ApolloClient<any>;

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
const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  const [ , {logout, refreshAccessToken, setUser}] = useAuthentication();

  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );

    for (let err of graphQLErrors) {
      console.log("Error", err?.extensions?.code);

      switch (err?.extensions?.code) {
        case "UNAUTHENTICATED":
          refreshAccessToken(
            (user: AuthenticatedUser) => {
              setUser(user);
            },
            () => {
              logout();
            }
          )

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
          break;

      }
    }
  }
    
  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const createApolloClient = (settings: CultureMapSettings) => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([
      authLink,
      new RetryLink({
        delay: {
          initial: 300,
          max: 20000,
          jitter: true
        },
        attempts: {
          max: 5,
          retryIf: (error, _operation) => !!error
        }
      }),
      errorLink,
      new HttpLink({
        uri: settings.apiUrl, // Server URL (must be absolute)
        credentials: "include", // Additional fetch() options like `credentials` or `headers`
      })
    ]),
    cache: new InMemoryCache({
      typePolicies: {
        Query: {
          fields: {
            allPosts: concatPagination(), // TODO: adjust to useful results ...
          },
        },
      },
    }),
  });
};

export const initializeApollo = (
  settings: CultureMapSettings,
  initialState = null
) => {
  const aClient = apolloClient ?? createApolloClient(settings);

  // If your page has Next.js data fetching methods that use Apollo Client, the initial state
  // gets hydrated here
  if (initialState) {
    // Get existing cache, loaded during client side data fetching
    const existingCache = aClient.extract();

    // Merge the existing cache into data passed from getStaticProps/getServerSideProps
    const data = merge(initialState ?? {}, existingCache ?? {}, {
      // combine arrays using object equality (like in sets)
      arrayMerge: (destinationArray, sourceArray) => [
        ...sourceArray,
        ...destinationArray.filter((d) =>
          sourceArray.every((s) => !isEqual(d, s))
        ),
      ],
    });

    // Restore the cache with the merged data
    aClient.cache.restore(data);
  }
  // For SSG and SSR always create a new Apollo Client
  if (typeof window === "undefined") return aClient;
  // Create the Apollo Client once in the client
  if (!apolloClient) apolloClient = aClient;

  return aClient;
};

export function addApolloState(client: ApolloClient<any>, pageProps: any) {
  if (pageProps?.props) {
    // eslint-disable-next-line no-param-reassign
    pageProps.props[APOLLO_STATE_PROP_NAME] = client.cache.extract();
  }

  return pageProps;
}

export function useApollo(pageProps: any, settings: CultureMapSettings) {
  const state = pageProps[APOLLO_STATE_PROP_NAME];
  const store = useMemo(
    () => initializeApollo(settings, state),
    [state, settings]
  );
  return store;
}

export default useApollo;
