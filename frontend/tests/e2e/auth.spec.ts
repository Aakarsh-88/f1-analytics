import { expect, test } from "@playwright/test";

import { hasTestCredentials, signIn } from "./utils/auth";

test.describe("Sign Up page", () => {
  test("renders the sign-up form", async ({ page }) => {
    await page.goto("/sign-up");
    // Clerk's <SignUp> component renders a real form — asserting on the
    // email field is enough to confirm the widget mounted correctly
    // without depending on Clerk's internal DOM structure beyond that.
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test("links to sign-in for existing accounts", async ({ page }) => {
    await page.goto("/sign-up");
    await expect(page.getByRole("link", { name: /sign in/i })).toBeVisible();
  });
});

test.describe("Sign In page", () => {
  test("renders the sign-in form", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByLabel(/email address/i)).toBeVisible();
  });

  test("links to sign-up for new accounts", async ({ page }) => {
    await page.goto("/sign-in");
    await expect(page.getByRole("link", { name: /sign up/i })).toBeVisible();
  });

  test("a real sign-in succeeds and redirects to the dashboard", async ({ page }) => {
    test.skip(!hasTestCredentials(), "requires E2E_TEST_EMAIL/E2E_TEST_PASSWORD env vars");

    await signIn(page);

    await expect(page).toHaveURL("/");
  });
});
