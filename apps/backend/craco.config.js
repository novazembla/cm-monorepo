const postCSSConfig = require("./postcss.config");
const path = require("path");

module.exports = {
  style: {
    postcss: {
      plugins: postCSSConfig.plugins,
    },
  },
  webpack: {
    alias: {
      "@": path.resolve(__dirname, "src/"),
    },
  }
};
