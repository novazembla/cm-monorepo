import type { InitialOptionsTsJest } from "ts-jest/dist/types";

// const esModules = ["@culturemap/core"].join("|");

const config: InitialOptionsTsJest = {
  testEnvironment: "node",
  preset: "ts-jest",
  testEnvironmentOptions: {
    NODE_ENV: "test",
  },
  coveragePathIgnorePatterns: ["node_modules", "tests"], /// TODO: , 'api/config', 'api/app.js' needed?
  coverageReporters: ["text", "lcov", "clover", "html"],
  // transform: {},
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
};

export default config;
