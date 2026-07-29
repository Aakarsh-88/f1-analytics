import type { Page } from "@playwright/test";

/**
 * Tests that need a genuinely authenticated session (Saved Views,
 * viewing Settings' content rather than just its redirect) read real
 * credentials from the environment rather than mocking Clerk in the
 * browser — Clerk's actual widget is what's being tested here, and a
 * mocked version wouldn't prove anything about the real integration.
 *
 * Set these to run the full authenticated suite locally or in CI:
 *   E2E_TEST_EMAIL, E2E_TEST_PASSWORD
 *
 * Tests needing them call `hasTestCredentials()` and `test.skip(...)`
 * when it's false, rather than failing with a confusing Clerk error.
 */
export function hasTestCredentials(): boolean {
  return Boolean(process.env.E2E_TEST_EMAIL && process.env.E2E_TEST_PASSWORD);
}

export async function signIn(page: Page): Promise<void> {
  const email = process.env.E2E_TEST_EMAIL;
  const password = process.env.E2E_TEST_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "signIn() called without E2E_TEST_EMAIL/E2E_TEST_PASSWORD set — guard the calling test with hasTestCredentials() first."
    );
  }

  await page.goto("/sign-in");
  await page.getByLabel(/email address/i).fill(email);
  await page.getByRole("button", { name: /continue/i }).click();
  await page.getByLabel(/^password$/i).fill(password);
  await page.getByRole("button", { name: /continue/i }).click();

  // Successful sign-in redirects to the configured post-sign-in path (/).
  await page.waitForURL("/");
}
