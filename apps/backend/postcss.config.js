require("dotenv").config();

const plugins = [
  // TODO: activate when CRA is postcss 8.0 ready require("postcss-inline-svg"),
  require("autoprefixer"),
];

module.exports = {
  plugins
};
