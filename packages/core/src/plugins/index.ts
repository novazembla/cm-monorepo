export type PluginScopes = "location" | "event" | "page";

export interface Plugin {
  name: string;
  scope: PluginScopes;
}

export interface Plugins {
  plugins: Array<Plugin>;
  register: (plugin: Plugin) => void;
  apply: (scope: string) => number;
}

export const plugins: Plugins = {
  plugins: [
    {
      name: "Lichtenberg Veranstaltung Plugin",
      scope: "event",
    }, 
  ],
  register(plugin: Plugin) {
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
