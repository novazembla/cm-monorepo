import { app, server } from "@culturemap/api";
import { config } from "@culturemap/core";

async function startApolloServer() {
  // before we start the server we want to make sure to
  // prepare the default settings and overwrite it with
  // additional customization and plugin initialization that might
  // have been done in ./culturemap.config.js
  // This is all done by clalling config.prepare()
  await config.prepare();

  // now start the appolo server
  await server.start();

  // and attach it to the express app
  server.applyMiddleware({ app });

  /*
    Here you could attach further routes and middleware to your express app

    app.use((req, res) => {
      res.status(200);
      res.send("Hello world!");
      res.end();
    });
  */

  // finally listen to the configured port
  app.listen({ port: config.env.API_PORT });

  // eslint-disable-next-line no-console
  console.log(
    `🚀 Server ready at http://localhost:${config.env.API_PORT}${server.graphqlPath}`
  );
}

startApolloServer();
