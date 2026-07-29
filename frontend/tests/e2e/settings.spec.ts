import { expect, test } from "@playwright/test";

import { hasTestCredentials, signIn } from "./utils/auth";

test.describe("Protected Settings page", () => {
  test("redirects to sign-in when visited while signed out", async ({ page }) => {
    // No credentials needed for this one — it's the middleware/guard
    // behavior itself under test, which is deterministic either way.
    await page.goto("/settings");

    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("renders account settings once signed in", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires E2E_TEST_EMAIL/E2E_TEST_PASSWORD env vars");

    await signIn(page);
    await page.goto("/settings");

    await expect(page).toHaveURL("/settings");
    await expect(page.getByText(/signed in as/i)).toBeVisible();
    await expect(page.getByText("Dark mode")).toBeVisible();
  });
});
