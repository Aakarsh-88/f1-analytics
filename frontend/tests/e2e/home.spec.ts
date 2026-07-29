import { expect, test } from "@playwright/test";

test.describe("Home / Dashboard", () => {
  test("loads and shows the core dashboard sections", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByRole("heading", { name: /dashboard|welcome back/i })).toBeVisible();
    await expect(page.getByText("Total Races")).toBeVisible();
    await expect(page.getByText("Total Drivers")).toBeVisible();
    await expect(page.getByText("Wins by Season")).toBeVisible();
    await expect(page.getByText("Latest Race Podium")).toBeVisible();
  });

  test("is reachable without authentication", async ({ page }) => {
    // No sign-in performed here on purpose — the dashboard is public.
    const response = await page.goto("/");
    expect(response?.status()).toBeLessThan(400);
    await expect(page).toHaveURL("/");
  });
});
