import { Plugin } from "@culturemap/core";

export const plugin: Plugin = {
  name: "Example",
  scope: "location",
  hooks: {
    "cron:daily": function () {
      // eslint-disable-next-line no-console
      console.log(`${this.name} cron:daily`);
    },
  },
};

export default plugin;
