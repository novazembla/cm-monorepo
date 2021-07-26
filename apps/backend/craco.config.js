const postCSSConfig = require("./postcss.config");
const path = require("path");
const CracoAlias = require("craco-alias");

module.exports = {
  style: {
    postcss: {
      plugins: postCSSConfig.plugins,
    },
  },
  typescript: {
    compilerOptions: {
      baseUrl: ".",
      paths: {
        "~/*": ["src/*"],
      },
    }
    
  },
  webpack: {
    alias: {
      "~": path.resolve(__dirname, "src/"),
    },
  },
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: "tsconfig",
        // baseUrl SHOULD be specified
        // plugin does not take it from tsconfig
        baseUrl: ".",
        /* tsConfigPath should point to the file where "baseUrl" and "paths" 
        are specified*/
        tsConfigPath: "./tsconfig.paths.json"
     }
    }
  ]
};
