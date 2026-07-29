import { expect, test } from "@playwright/test";

import { hasTestCredentials, signIn } from "./utils/auth";

test.describe("Saved Views", () => {
  test("shows a sign-in prompt when signed out", async ({ page }) => {
    await page.goto("/analytics");

    await expect(page.getByText(/sign in to save/i)).toBeVisible();
  });

  test("signed-in user can save and load a view", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires E2E_TEST_EMAIL/E2E_TEST_PASSWORD env vars");

    await signIn(page);
    await page.goto("/analytics");

    await page.getByLabel("From").selectOption("2023");
    await page.getByLabel("To").selectOption("2024");

    const nameInput = page.getByPlaceholder(/rivalry/i);
    await nameInput.fill("E2E Test View");
    await page.getByRole("button", { name: /save 2023–2024/i }).click();

    await expect(page.getByText("E2E Test View")).toBeVisible();

    // Reset the range, then load the saved view back and confirm it restores it.
    await page.getByLabel("From").selectOption("2021");
    await page.getByLabel("To").selectOption("2025");

    await page.getByText("E2E Test View").click();

    await expect(page.getByLabel("From")).toHaveValue("2023");
    await expect(page.getByLabel("To")).toHaveValue("2024");

    // Clean up so repeated test runs don't accumulate saved views.
    await page.getByRole("button", { name: /delete saved view "e2e test view"/i }).click();
    await expect(page.getByText("E2E Test View")).not.toBeVisible();
  });
});
