const nextJest = require("next/jest");

// next/jest reads next.config.js and .env files automatically, and
// wires up SWC-based transforms so TSX/JSX and the @/* path alias work
// the same way in tests as they do in the real app build.
const createJestConfig = nextJest({ dir: "./" });

/** @type {import('jest').Config} */
const customJestConfig = {
  setupFilesAfterEnv: ["<rootDir>/tests/setup/jest.setup.ts"],
  testEnvironment: "jest-environment-jsdom",
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  // E2E specs live under tests/e2e and are run by Playwright, not Jest —
  // excluding them here keeps `npm test` fast and prevents Jest from
  // trying (and failing) to execute Playwright's test() API.
  testPathIgnorePatterns: ["<rootDir>/.next/", "<rootDir>/node_modules/", "<rootDir>/tests/e2e/"],
  testMatch: ["<rootDir>/tests/unit/**/*.test.[jt]s?(x)"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/middleware.ts",
    "!src/app/**/layout.tsx",
    "!src/app/**/loading.tsx",
    "!src/app/**/not-found.tsx",
    "!src/app/**/error.tsx",
  ],
  coverageThreshold: {
    global: {
      statements: 30,
      branches: 20,
      functions: 25,
      lines: 30,
    },
  },
};

module.exports = createJestConfig(customJestConfig);
