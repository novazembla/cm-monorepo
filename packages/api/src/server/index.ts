import { ApolloServer } from "apollo-server-express";
import { typeDefs, resolvers } from "../graphql";

export const server = new ApolloServer({
  typeDefs,
  resolvers,
});

export default server;
