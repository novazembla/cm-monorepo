/* eslint-disable no-undef */
// eslint-disable-next-line @typescript-eslint/no-var-requires, no-undef
require("dotenv").config();

const plugins = [
  // TODO: activate when CRA is postcss 8.0 ready require("postcss-inline-svg"),
  require("autoprefixer"),
];

module.exports = {
  plugins
};
