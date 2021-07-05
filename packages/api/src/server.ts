import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphql";

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default server;
