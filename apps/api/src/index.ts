import { app, server } from "@culturemap/api";
import { config } from "@culturemap/core";

async function startApolloServer() {
  await config.config();

  await server.start();

  server.applyMiddleware({ app });

  app.use((req, res) => {
    res.status(200);
    res.json({ xxx: "Hello! 222" });
    res.end();
  });

  console.log(config.culturemap);

  app.listen({ port: config.env.API_PORT });

  // app.liste n({ port: 8080 });

  // eslint-disable-next-line no-console
  console.log(
    `🚀 Server ready at http://localhost:${config.env.API_PORT}${server.graphqlPath}`
  );
  return { server, app };
}

startApolloServer();
