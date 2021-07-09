export type PluginScopes = "location" | "event" | "page";

export enum PluginHooksEnum {
  GQLSCHEMA = "graphql:schema",
  CRONDAILY = "cron:daily",
  EDITFIELDS = "edit:fields",
}

export interface Plugin {
  name: string;
  scope: PluginScopes;
  hooks: { [key in PluginHooksEnum]?: Function };
}

export interface Plugins {
  plugins: Array<Plugin>;
  register: (plugin: Plugin) => void;
  apply: (scope: string) => number;
}

export const plugins: Plugins = {
  plugins: [],
  register(plugin: Plugin) {
    // TODO: the plugins mus do some sanity check, right?
    this.plugins.push(plugin);
  },
  apply(scope: string) {
    let count = 0;
    this.plugins.forEach((plugin) => {
      if (plugin.scope === scope) {
        count += 1;
      }
    });
    return count;
  },
};

export default plugins;
