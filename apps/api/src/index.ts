import {
  app,
  initializeExpressApp,
  startApi,
  initializeApolloServer,
  config,
} from "@culturemap/api";
import { Request, Response } from "express";
// #ENABLE FOR PLUGIN USE import { plugins } from "@culturemap/core";

// #ENABLE FOR PLUGIN USE import examplePlugins from "plugin-example";

// @ts-ignore (CMSetting is JS file)
import CMSettings from "../culturemap";

const start = async () => {
  // #ENABLE FOR PLUGIN USE
  // you can register additional plugins that provide hooks that will be called at
  // appropriate places (aka "hooks") to extend the core functionality
  // plugins.register(examplePlugins);

  // The api makes use of the default prisma.schema found in
  // ./packages/api/prisma/ you can run your own schema  by extending/changing
  // the base schema and having a second prisma folder, generating an own
  // Prisma client and setting the instance before you start the server.
  // Set the instance by importing db from @culturemap/api and then calling
  // db.setPrismaClient(YourPrismaClientInstance)
  //
  // import { app, server, db } from "@culturemap/api"
  // db.setPrismaClient(prismaClientInstance)

  // before we start the server we want to make sure to
  // prepare the default settings and overwrite it with
  // additional customization and plugin initialization that might
  // have been done in ./culturemap.js
  // This is all done by clalling config.update() and passing the imported settings

  config.updateApiConfig(CMSettings);

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

  // this is to make sure that the root domain is anwering something.
  app.get("/", function (req: Request, res: Response) {
    res.send("ok");
  });

  // app.use(errorToApiErrorConverter);
  // app.use(errorDisplayInResponse);

  // now configure the server (either pass a GraphQL Schema)
  // or use the preinstalled one by not setting and config settings.
  initializeApolloServer();

  // and now run the whole thing ...
  await startApi();
};

process.on("uncaughtException", function (exception) {
  if (process.stderr) {
    process.stderr.write(exception.message);
  } else {
    console.error(exception);
  }
});

process.on("unhandledRejection", (reason, p) => {
  var message = '"Unhandled Rejection at: Promise '
    .concat(p as any, " reason: ")
    .concat(reason as any);
  if (process.stderr) {
    process.stderr.write(message);
  } else {
    console.error(message);
  }
});
process.on("exit", (code) => {
  console.log("Process exited with code: ".concat(code as any));
});
process.on("SIGTERM", (/* signal */) => {
  console.log(
    "Process ".concat(process.pid as any, " received a SIGTERM signal")
  );
  process.exit(0);
});
process.on("SIGINT", (/* signal */) => {
  console.log("Process ".concat(process.pid as any, " has been interrupted"));
  process.exit(0);
});

start();
