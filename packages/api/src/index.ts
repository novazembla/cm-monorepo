import { ApolloServer } from "apollo-server-express";

import app from "./app";
import { typeDefs, resolvers } from "./graphql";

async function startApolloServer() {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });
  await server.start();

  server.applyMiddleware({ app });

  app.use((req, res) => {
    res.status(200);
    res.json({"xxx":"Hello! 222"});
    res.end();
  });

  app.listen({ port: 8080 });

  // eslint-disable-next-line no-console
  console.log(`🚀 Server ready at http://localhost:8080${server.graphqlPath}`);
  return { server, app };
}

startApolloServer();
