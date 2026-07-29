import { expect, test } from "@playwright/test";

test.describe("Analytics page", () => {
  test("loads all chart sections", async ({ page }) => {
    await page.goto("/analytics");

    await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
    await expect(page.getByText("Constructor Dominance")).toBeVisible();
    await expect(page.getByText("Pole Positions (All-Time)")).toBeVisible();
    await expect(page.getByText("Fastest Laps (All-Time)")).toBeVisible();
    await expect(page.getByText("Average Qualifying Position")).toBeVisible();
    await expect(page.getByText("Podium Trends")).toBeVisible();
  });

  test("changing the season range updates the filter selects", async ({ page }) => {
    await page.goto("/analytics");

    const fromSelect = page.getByLabel("From");
    const toSelect = page.getByLabel("To");

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
