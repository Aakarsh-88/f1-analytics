import { expect, test } from "@playwright/test";

test.describe("Global search", () => {
  test("finds a driver and navigates to their profile", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(/search drivers, teams, races/i).fill("Hamilton");
    await page.getByText("Lewis Hamilton").click();

    await expect(page).toHaveURL("/drivers/hamilton");
  });

  test("finds a constructor", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(/search drivers, teams, races/i).fill("Ferrari");

    await expect(page.getByText("Ferrari")).toBeVisible();
  });

  test("shows a no-results message for a nonsense query", async ({ page }) => {
    await page.goto("/");

    await page.getByPlaceholder(/search drivers, teams, races/i).fill("zzz-nonexistent-query");

    await expect(page.getByText(/no results for/i)).toBeVisible();
  });

  test("closes the dropdown on outside click", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder(/search drivers, teams, races/i);
    await searchInput.fill("Ferrari");
    await expect(page.getByText("Ferrari")).toBeVisible();

    await page.getByRole("heading", { name: /dashboard|welcome back/i }).click();

    await expect(page.getByText("Ferrari")).not.toBeVisible();
  });
});
