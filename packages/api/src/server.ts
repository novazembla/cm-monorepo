import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { DirectiveFieldAuth } from "./graphql/directives";

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: false,
  schemaDirectives: {
    fieldauth: DirectiveFieldAuth,
  },
  context: ({ req }) => {
    const token = req.headers.authorization;
    // const currentUser = {}; // TODO: User.getUserByToken(token);
    return { user: token ? 1 : 0 };
  },
});

export default server;
