declare type PluginScopes = "location" | "event" | "page";
interface Plugin {
    name: string;
    scope: PluginScopes;
}
export interface Plugins {
    plugins: Array<Plugin>;
    register: (plugin: Plugin) => void;
    apply: (scope: string) => number;
}
export declare const plugins: Plugins;
export default plugins;
