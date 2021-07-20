import {
  app,
  addTerminatingErrorHandlingToApp,
  initializeExpressApp,
  server,
  initializeServer,
  config,
} from "@culturemap/api";
import { plugins } from "@culturemap/core";
import examplePlugins from "plugin-example";

// @ts-ignore (CMSetting is JS file)
import CMSettings from "../culturemap";

async function startApolloServer() {
  // you can register additional plugins that provide hooks that will be called at
  // appropriate places (aka "hooks") to extend the core functionality
  plugins.register(examplePlugins);

  // The api makes use of the default prisma.schema found in
  // ./packages/api/prisma/ you can run your own schema  by extending/changing
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

  // cors settings do need to be set twice for the express app (serving everything)
  // but ../graphql served by the apollo server. Apropriate defaults are in place but
  // you can overwrite them using the following method.
  // config.updateCors(cors);

  // as now evertying is configured initialize the express app.
  initializeExpressApp();

  /*
    Here you could attach further routes and middleware to your express app

    app.use((req, res) => {
      res.status(200);
      res.send("Hello world!");
      res.end();
    });
  */

  // change TODO:
  // this is to make sure that the root domain is anwering something.
  app.get("/", function (req, res) {
    res.send("ok");
  });

  // remove TODO: remove
  app.get("/err", function () {
    throw Error("dasfdsffdsa");
  });

  // app.use(errorToApiErrorConverter);
  // app.use(errorDisplayInResponse);

  // as well as the apollo server instance.
  // now configure the server (either pass a GraphQL Schema)
  // or use the preinstalled one.
  initializeServer();

  if (server) {
    // now start the appolo server
    await server.start();

    // and attach it to the express app
    server.applyMiddleware({
      app,
      cors: config.corsOptions as any,
    });
  }

  // make sure that any unprocessed errors are displayed in a nice and (data) safe way
  addTerminatingErrorHandlingToApp();

  // finally listen to the configured port
  app.listen({ port: process.env.API_PORT }, () => {
    // eslint-disable-next-line no-console
    console.log(
      `🚀 Server ready at http://localhost:${process.env.API_PORT}${server?.graphqlPath}`
    );
  });
}

startApolloServer();
