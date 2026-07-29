import { expect, test } from "@playwright/test";

test.describe("Global search", () => {
  test("finds a driver and navigates to their profile", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder(/search drivers, teams, races/i);

    await searchInput.fill("Max");

    await page.getByRole("button", { name: /Max Verstappen/i }).click();

    await expect(page).toHaveURL(/drivers/);
  });

  test("finds a constructor", async ({ page }) => {
    await page.goto("/");

    await page
      .getByPlaceholder(/search drivers, teams, races/i)
      .fill("Ferrari");

    await expect(
      page.getByRole("button", {
        name: /Ferrari.*Constructor/i,
      })
    ).toBeVisible();
  });

  test("shows a no-results message for a nonsense query", async ({ page }) => {
    await page.goto("/");

    await page
      .getByPlaceholder(/search drivers, teams, races/i)
      .fill("zzzzzz");

    await expect(
      page.getByText(/no results/i)
    ).toBeVisible();
  });

  test("closes the dropdown on outside click", async ({ page }) => {
    await page.goto("/");

    const searchInput = page.getByPlaceholder(
      /search drivers, teams, races/i
    );

    await searchInput.fill("Ferrari");

    const ferrariResult = page.getByRole("button", {
      name: /Ferrari.*Constructor/i,
    });

    await expect(ferrariResult).toBeVisible();

    await page.getByRole("heading", { name: /dashboard|welcome back/i }).click();

    await expect(ferrariResult).toBeHidden();
  });
});