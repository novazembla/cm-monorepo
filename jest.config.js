module.exports = {
  testEnvironment: 'node',
  testEnvironmentOptions: {
    NODE_ENV: 'test',
  },
  restoreMocks: true,
  coveragePathIgnorePatterns: ['node_modules', 'tests'], /// TODO: , 'api/config', 'api/app.js' needed? 
  coverageReporters: ['text', 'lcov', 'clover', 'html'],
};
