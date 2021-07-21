import { ApolloServer } from "apollo-server-express";

import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageGraphQLPlayground,
  AuthenticationError,
  ValidationError,
} from "apollo-server-core";
import httpStatus from "http-status";
import { GraphQLSchema } from "graphql/type/schema";
import { schema, context } from "./nexus-graphql";
import { ApolloLogPlugin } from "./utils/ApolloLogPlugin";
import { logger } from "./services/serviceLogging";
import { ApiError } from "./utils/ApiError";

// eslint-disable-next-line import/no-mutable-exports
export let server: ApolloServer | null = null;

export const initializeServer = (customSchema?: GraphQLSchema | undefined) => {
  server = new ApolloServer({
    schema: customSchema || schema,
    context,
    formatError: (err) => {
      let returnedErr: Error = err;

      const msg = `ApolloServer [${err?.path?.join(", ") ?? ""}]`;
      const stackTrace = err?.extensions?.exception?.stacktrace?.join("\n");

      // map the error returned by nexus' fieldAuthorizePlugin() to an apollo error
      if (err.name === "GraphQLError" && err.message === "Not authorized") {
        // the plugin passes the originally raised error as originalError throug
        // as it is wrapped in an GraphQLError let us get the original message and pass it on
        const authMessage =
          (err?.originalError as Error & { originalError?: Error })
            ?.originalError?.message ?? err.message;

        logger.warn(`${msg} AuthenticationError: ${authMessage}`);

        return new AuthenticationError(authMessage);
      }

      if (err.name === "ForbiddenError" || err.name === "AuthenticationError") {
        if (process.env.NODE_ENV === "development") {
          logger.debug(`${msg} ${stackTrace}`);
        } else {
          logger.warn(`${msg} ${returnedErr.name} ${returnedErr.message}`);
        }
        return err;
      }
      if (err.name === "ValidationError" || err.name === "UserInputError") {
        if (process.env.NODE_ENV === "development") {
          logger.debug(`${msg} ${stackTrace}`);
        }
        return err;
      }

      // but mayb the API raised an error. Let's make sure it's message got though.
      if (err.name === "GraphQLError") {
        if (err?.extensions?.exception?.name === "ApiError") {
          returnedErr = new ApiError(
            err?.extensions?.exception?.statusCode,
            err?.extensions?.exception?.message,
            err?.extensions?.exception?.isOperational,
            process.env.NODE_ENV === "development"
              ? err?.extensions?.exception?.stacktrace
              : undefined
          );
        }
      }

      if (err.name === "GraphQLError") {
        if (err?.extensions?.code === "GRAPHQL_VALIDATION_FAILED") {
          return new ValidationError(err?.extensions?.exception?.message);
        }
        if (err?.extensions?.code === "UNAUTHENTICATED") {
          return new AuthenticationError(
            err?.extensions?.exception?.message ?? err.message
          );
        }
      }

      if (err.name === "GraphQLError") {
        if (err?.extensions?.code === "GRAPHQL_VALIDATION_FAILED") {
          return new ValidationError(err?.extensions?.exception?.message);
        }
        if (err?.extensions?.code === "UNAUTHENTICATED") {
          return new AuthenticationError(
            err?.extensions?.exception?.message ?? err.message
          );
        }
      }

      // finally make sure to only return api errors
      if (returnedErr.name !== "ApiError") {
        // TODO: remove this one once error handling is stable ..
        // eslint-disable-next-line no-console
        console.error(
          `ERROR ERROR ERROR !!!! Untracked GraphQL Error ${err.name} ${err.message}`,
          err
        );
        logger.error(
          `ERROR ERROR ERROR !!!! Untracked Error in Apollo ${err.name} ${err.message}`
        );

        let code = httpStatus.INTERNAL_SERVER_ERROR;

        if (err?.extensions?.code === "UNAUTHENTICATED")
          code = httpStatus.UNAUTHORIZED;

        returnedErr = new ApiError(
          code,
          `${err.name} ${err.message}`,
          true,
          process.env.NODE_ENV === "development" ? stackTrace : undefined
        );
      }

      if (process.env.NODE_ENV === "development") {
        logger.debug(`${msg} ${stackTrace}`);
      } else {
        logger.warn(`${msg} ${returnedErr.name} ${returnedErr.message}`);
      }
      return returnedErr;
    },
    plugins: [
      // Install a landing page plugin based on NODE_ENV
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault({
            footer: false,
          })
        : ApolloServerPluginLandingPageGraphQLPlayground(),
      ApolloLogPlugin({
        logger,
      }),
    ],
    debug: process.env.NODE_ENV === "development",
  });
};

export default server;