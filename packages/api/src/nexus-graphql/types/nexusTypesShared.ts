/// <reference path="../../types/nexus-typegen.ts" />

import { objectType } from "nexus";

export const BooleanResult = objectType({
  name: "BooleanResult",
  definition(t) {
    t.nonNull.boolean("result");
  },
});

export default {
  BooleanResult,
};
