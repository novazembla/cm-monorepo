import { app, server, config } from "@culturemap/api";
import { plugins } from "@culturemap/core";
import examplePlugins from "plugin-example";
import CMSettings from "../culturemap";

async function startApolloServer() {
  // you can register additional plugins that provide hooks that will be called at
  // appropriate places (aka "hooks") to extend the core functionality
  plugins.register(examplePlugins);

  // The api makes use of the default prisma.schema found in
  // ./packages/api/prisma/ you can run your own schema by extending/changing
  // the base schema and having a second prisma folder, generating an own
  // Prisma client and setting the instance before you start the server.
  // Set the instance by importing db from @culturemap/api and then calling
  // db.setPrismaClient(YourPrismaClientInstance)
  //
  // import { app, server, db } from "@culturemap/api"
  // db.setPrismaClient(prismaClientInstance)
  //

  // before we start the server we want to make sure to
  // prepare the default settings and overwrite it with
  // additional customization and plugin initialization that might
  // have been done in ./culturemap.js
  // This is all done by clalling config.update() and passing the imported settings
  config.update(CMSettings);

  // now start the appolo server
  await server.start();

  // and attach it to the express app
  server.applyMiddleware({ app });

  app.get("/", function (req, res) {
    res.json({ hello: "Hello World" });
  });

  /*
    Here you could attach further routes and middleware to your express app

    app.use((req, res) => {
      res.status(200);
      res.send("Hello world!");
      res.end();
    });
  */

  // finally listen to the configured port
  app.listen({ port: process.env.API_PORT }, () => {
    // eslint-disable-next-line no-console
    console.log(
      `🚀 Server ready at http://localhost:${process.env.API_PORT}${server.graphqlPath}`
    );
  });
}

startApolloServer();
