type PluginScopes = "location" | "event" | "page";

interface Plugin {
  name: string,
  scope: PluginScopes
}

interface Plugins {
  plugins: Array<Plugin>,
  register: Function,
  apply: Function; 
}

const plugins: Plugins = {
  plugins: [{
    name: 'Lichtenberg Veranstaltung Plugin',
    scope: 'event'
  }],
  register: () => console.log('Register plugin'),
  apply: () => console.log('Register plugin')
};

export default plugins
