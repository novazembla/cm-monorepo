import { ApolloServer, AuthenticationError } from "apollo-server-express";
import {
  ApolloServerPluginLandingPageProductionDefault,
  ApolloServerPluginLandingPageGraphQLPlayground,
} from "apollo-server-core";
import { makeExecutableSchema } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql";
import { typeDefs, resolvers } from "./graphql";
import { AuthenticatedUser, authenticateUserByToken } from "./services/auth";

// TODO: include import { DirectiveAuth } from "./graphql/directives";

// eslint-disable-next-line import/no-mutable-exports
export let server = null;

export const initializeServer = (schema?: GraphQLSchema | undefined) => {
  server = new ApolloServer({
    schema:
      schema ||
      makeExecutableSchema({
        typeDefs,
        resolvers,
        // xxx fix https://www.graphql-tools.com/docs/schema-directives/ TODO:: FIX:
        // schemaTransforms: [DirectiveAuth]
      }),
    context: ({ req, res }) => {
      let user: AuthenticatedUser;

      let token = req?.headers?.authorization;

      if (token) {
        try {
          if (token.indexOf("Bearer ") !== -1)
            token = token.replace("Bearer ", "");

          user = authenticateUserByToken(token);
          if (!user) {
            throw new AuthenticationError("Access denied (C1)");
          }
        } catch (Err) {
          throw new AuthenticationError("Access denied (C2)");
        }
      }

      return { req, res, user };
    },
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
