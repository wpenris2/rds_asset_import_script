import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  moduleFileExtensions: ["ts", "js"],
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/index.ts"],
  coverageDirectory: "coverage",
  clearMocks: true
};

export default config;
