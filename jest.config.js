const { readFileSync } = require('fs');
const { parse } = require('jsonc-parser');

// Read tsconfig as text and parse it with jsonc-parser to handle comments
const tsConfig = parse(readFileSync('./tsconfig.json').toString());

module.exports = {
  preset: 'jest-preset-angular',
  roots: ['<rootDir>'],
  testMatch: ['**/+(*.)+(spec).+(ts)'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  collectCoverage: true,
  coverageReporters: ['html', 'lcov', 'text-summary'],
  coverageDirectory: 'coverage',
  moduleNameMapper: {
    '@tododay/(.*)': '<rootDir>/projects/tododay/src/app/$1'
  },
  testEnvironment: 'jsdom'
};
