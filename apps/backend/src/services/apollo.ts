import {
  from,
  ApolloClient,
  InMemoryCache,
  ApolloLink,
  Observable,
  HttpLink,
} from "@apollo/client";
import { authRefreshMutationGQL } from "@culturemap/core";
import { onError } from "@apollo/client/link/error";
import { RetryLink } from "@apollo/client/link/retry";

import { authentication, user } from ".";

import { getAppConfig, AppConfig } from "~/config";

const config = getAppConfig();

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
          const { message, extensions } = graphQLError;
          if (message === "Access Denied" && extensions?.code === "FORBIDDEN") {
            const observableForbidden = new Observable((observer) => {
              new Promise(async (resolve) => {
                await user.logout();
                observer.error(new Error("Access Denied - FORBIDDEN "));
              });
            });
            observables.push(observableForbidden);
          } else if (
            message === "Authentication failed (maybe refresh)" &&
            extensions?.code === "UNAUTHENTICATED"
          ) {
            const observable = new Observable((observer) => {
              if (
                client
              ) {
                user.setAllowRefresh(false);
                user.setRefreshing(true);
                client
                  .mutate({
                    fetchPolicy: "no-cache",
                    mutation: authRefreshMutationGQL,
                    variables: {
                      scope: config.scope,
                    },
                  }) 
                  .then(({ data }: any) => {
                    if (
                      data?.authRefresh?.tokens?.access &&
                      data?.authRefresh?.tokens?.preview &&
                      data?.authRefresh?.tokens?.refresh
                    ) {
                      const payload = authentication.getTokenPayload(
                        data.authRefresh.tokens.access
                      );
                      const payloadPreview = authentication.getTokenPayload(
                        data.authRefresh.tokens.preview
                      );

                      if (payload && payloadPreview) {
                        authentication.setAuthToken(
                          data.authRefresh.tokens.access
                        );
                        authentication.setPreviewToken(
                          data.authRefresh.tokens.preview
                        );
                        authentication.setRefreshCookie(
                          data.authRefresh.tokens.refresh
                        );

                        user.setAllowRefresh(true);
                        user.login(payload.user);

                        operation.setContext(({ headers = {} }) => ({
                          headers: {
                            ...headers,
                            authorization: `Bearer ${data.authRefresh.tokens.access.token}`,
                          },
                        }));
                      } else {
                        throw new Error("Unable to fetch new access token (1)");
                      }
                    } else {
                      throw new Error("Unable to fetch new access token (2)");
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
                  .catch(async (error) => {
                    await user.logout();

                    observer.error(error);
                  });
              }
              // else {
              //   observer.error(Error("Can't refresh session"));
              // }
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
  if (graphQLErrors) {
    graphQLErrors.forEach((err) =>
      console.log(
        err,
        `[GQLError error]: ${err.message} ${err?.extensions?.code ?? ""}`
      )
    );
  }

  if (networkError) console.log(`[Network error]: ${networkError}`);
});

const createApolloClient = (settings: AppConfig) => {
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
            console.log(
              error,
              `Will retry C:${parseInt(error.statusCode, 10)} ${
                !!error &&
                ![400, 403, 404].includes(parseInt(error.statusCode, 10))
              }`
            );
            return (
              !!error &&
              ![400, 403, 404].includes(parseInt(error.statusCode, 10))
            );
          },
        },
      }),
      errorLink,
      new HttpLink({
        uri: settings.apiGraphQLUrl, // Server URL (must be absolute)
        credentials: "include", // Additional fetch() options like `credentials` or `headers`
      }),
    ]),
    cache: new InMemoryCache({
      // TODO: add caching info ... 
    }),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      query: {
        // TODO: revist better caching at some point
        fetchPolicy: "network-only",
        errorPolicy: "all",
      },
      mutate: {
        errorPolicy: "all",
      },
    },
  });
};

export const initializeClient = (settings: AppConfig) => {
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
