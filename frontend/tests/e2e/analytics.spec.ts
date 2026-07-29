import { expect, test } from "@playwright/test";

test.describe("Analytics page", () => {
  test("loads all chart sections", async ({ page }) => {
    await page.goto("/analytics");

    await expect(
      page.getByRole("heading", { name: "Analytics" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Constructor Dominance" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Pole Positions (All-Time)" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Fastest Laps (All-Time)" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Average Qualifying Position" })
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { name: "Podium Trends" })
    ).toBeVisible();
  });

  test("changing the season range updates the filter selects", async ({ page }) => {
    await page.goto("/analytics");

    const selects = page.locator("select");

    const fromSelect = selects.first();
    const toSelect = selects.nth(1);

    await fromSelect.selectOption("2023");
    await toSelect.selectOption("2024");

    await expect(fromSelect).toHaveValue("2023");
    await expect(toSelect).toHaveValue("2024");
  });

  test("is reachable via the sidebar", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: "Analytics" }).click();

    await expect(page).toHaveURL("/analytics");
  });
});