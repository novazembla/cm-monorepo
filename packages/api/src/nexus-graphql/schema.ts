/// <reference path="../typings/nexus-typegen.ts" />

import { makeSchema, fieldAuthorizePlugin } from "nexus";
import { dirname, resolve, join } from "path";

import * as types from "./types";

const packageRootDir = join(resolve(dirname(""), "packages/api"));
// TODO: interesting plugins:
// https://www.npmjs.com/package/nexus-args-validation
// https://www.npmjs.com/package/@jcm/nexus-plugin-datetime
// https://nexusjs.org/docs/plugins/query-complexity

export const schema = makeSchema({
  types,
  outputs: {
    typegen: join(packageRootDir, "src/typings/nexus-typegen.ts"),
    schema: join(packageRootDir, "graphql/schema.graphql"),
  },
  contextType: {
    module: join(packageRootDir, "src/nexus-graphql/context.ts"),
    export: "NexusResolverContext",
  },
  plugins: [fieldAuthorizePlugin()],
});

export default schema;
