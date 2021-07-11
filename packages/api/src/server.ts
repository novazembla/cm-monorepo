import { ApolloServer, AuthenticationError } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";
import { DirectiveAuth } from "./graphql/directives";

export const server = new ApolloServer({
  typeDefs,
  resolvers,
  uploads: false,
  schemaDirectives: {
    auth: DirectiveAuth,
  },
  context: ({ req }) => {
    const token = req.headers.authorization;

    // read cookie here ..
    // get user from token ..
    // TODO: write/delete actions have to confirm token in DB
    // const currentUser = {}; // TODO: User.getUserByToken(token);

    const user = Math.random() < 0.2 ? 1 : 0;
    // if (!user) throw new AuthenticationError("Access Denied");

    if (user > 2) throw AuthenticationError;

    return { user, token };
  },
});

export default server;
