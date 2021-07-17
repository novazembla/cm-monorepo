import { ApolloServer } from "apollo-server-express";

import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { GraphQLSchema } from "graphql/type/schema";
import { schema, context } from "./graphql";

// eslint-disable-next-line import/no-mutable-exports
export let server: ApolloServer | null = null;

export const initializeServer = (customSchema?: GraphQLSchema | undefined) => {
  server = new ApolloServer({
    schema: customSchema || schema,
    context,
    formatError: (err) => {
      // Don't give the specific errors to the client.
      if (
        err.message.startsWith(
          "TODO: ... better error handling Database Error: "
        )
      ) {
        return new Error("Internal server error");
      }
      // Otherwise return the original error. The error can also
      // be manipulated in other ways, as long as it's returned.
      return err;
    },
    plugins: [
      // Install a landing page plugin based on NODE_ENV
      process.env.NODE_ENV === "production"
        ? ApolloServerPluginLandingPageProductionDefault({
            footer: false,
          })
        : ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });
};

export default server;
