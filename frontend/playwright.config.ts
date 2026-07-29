import { defineConfig, devices } from "@playwright/test";

/**
 * E2E tests assume a running instance of the app (see webServer below,
 * which starts `npm run dev` automatically unless BASE_URL is already
 * set to point at a deployed environment). Tests that need a signed-in
 * session read credentials from E2E_TEST_EMAIL/E2E_TEST_PASSWORD env
 * vars — see tests/e2e/auth.spec.ts for exactly which tests need them
 * and how they skip gracefully when unset, rather than failing with a
 * confusing error.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [["html", { open: "never" }], ["list"]],

  use: {
    baseURL: process.env.BASE_URL ?? "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],

  webServer: process.env.BASE_URL
    ? undefined
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
