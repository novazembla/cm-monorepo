import {
  from,
  ApolloClient,
  HttpLink,
  InMemoryCache,
  ApolloLink,
  Observable,
} from "@apollo/client";
import { userRefreshMutationGQL } from "@culturemap/core";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import { authentication, user } from ".";
import { CultureMapSettings } from "../context";

export let client: ApolloClient<any> | null = null;

const authLink = new ApolloLink((operation, forward) => {
  // retrieve access token from memory
  const accessToken = authentication.getAuthToken();

  if (accessToken) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${accessToken.token}`,
      },
    }));
  }

  // Call the next link in the middleware chain.
  return forward(operation);
});

// Log any GraphQL errors or network error that occurred
const retryWithRefreshTokenLink = onError(
  ({ graphQLErrors, networkError, operation, forward }) => {
    if (graphQLErrors) {
      const observables: Observable<any>[] = graphQLErrors.reduce(
        (observables, graphQLError) => {
          const { extensions } = graphQLError;
          if (
            graphQLError.message === "Authentication failed (maybe refresh)" &&
            extensions &&
            extensions.code &&
            extensions.code === "UNAUTHENTICATED"
          ) {
            const observable = new Observable((observer) => {
              if (client) {
                client.mutate({
                  mutation: userRefreshMutationGQL,
                })//     // TODO: is there a way to get a typed query here?
                .then(({ data }: any) => {
                  if (
                    data?.userRefresh?.tokens?.access &&
                    data?.userRefresh?.tokens?.refresh
                  ) {
                    const payload = authentication.getTokenPayload(
                      data.userRefresh.tokens.access
                    );

                    if (payload) {
                      console.log("Refreshed", payload);
                      authentication.setAuthToken(
                        data.userRefresh.tokens.access
                      );
                      authentication.setRefreshCookie(
                        data.userRefresh.tokens.refresh
                      );

                      user.setRefreshing(false);
                      user.login(payload.user);

                      operation.setContext(({ headers = {} }) => ({
                        headers: {
                          ...headers,
                          authorization: `Bearer ${data.userRefresh.tokens.access.token}`,
                        },
                      }));
                    } else {
                      throw new Error("Unable to fetch new access token");
                    }
                  } else {
                    throw new Error("Unable to fetch new access token");
                  }
                })
                .then(() => {
                  const subscriber = {
                    next: observer.next.bind(observer),
                    error: observer.error.bind(observer),
                    complete: observer.complete.bind(observer),
                  };

                  forward(operation).subscribe(subscriber);
                })
                .catch((error) => {

                  user.logout();
                  
                  observer.error(error);
                });
              }
              
            });
            observables.push(observable);
          }
          return observables;
        },
        [] as Observable<any>[]
      );

      if (observables.length) return observables.shift();
    }
  }
);

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach((err) =>
      console.log(`[GQLError error]: ${err.message} ${err?.extensions?.code}`)
    );

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const createApolloClient = (settings: CultureMapSettings) => {
  return new ApolloClient({
    ssrMode: typeof window === "undefined",
    link: from([
      authLink,
      retryWithRefreshTokenLink,
      new RetryLink({
        delay: {
          initial: 500,
          max: 20000,
          jitter: true,
        },
        attempts: {
          max: 3,
          retryIf: (error, _operation) => {
            console.log("Calling retryIf", error, _operation);
            return !!error;
          },
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
      // },¸
    }),
  });
};

export const initializeClient = (settings: CultureMapSettings) => {
  console.log("initializeClient");
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
