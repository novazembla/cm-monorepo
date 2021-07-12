import { ApolloServer, AuthenticationError } from "apollo-server-express";
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
    context: ({ req /* , res  */ }) => {
      let user: AuthenticatedUser;

      if ("cookies" in req && "authToken" in req.cookies) {
        const { token } = req.cookies;

        user = authenticateUserByToken(token);

        if (!user) {
          throw new AuthenticationError("Access denied");
        }
      }

      return { user };
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
  });
};

export default server;
