import { expect, test } from "@playwright/test";

test.describe("Sidebar navigation", () => {
  const routes: { label: string; url: string }[] = [
    { label: "Dashboard", url: "/" },
    { label: "Drivers", url: "/drivers" },
    { label: "Constructors", url: "/constructors" },
    { label: "Race Explorer", url: "/races" },
    { label: "Championship", url: "/standings" },
    { label: "Analytics", url: "/analytics" },
  ];

  for (const route of routes) {
    test(`navigates to ${route.label}`, async ({ page }) => {
      await page.goto("/");
      await page.getByRole("link", { name: route.label }).click();
      await expect(page).toHaveURL(route.url);
    });
  }

  test("navigating to Settings while signed out redirects to sign-in", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page).toHaveURL(/\/sign-in/);
  });

  test("highlights the active nav item", async ({ page }) => {
    await page.goto("/drivers");
    const driversLink = page.getByRole("link", { name: "Drivers" });
    await expect(driversLink).toHaveClass(/text-f1-red/);
  });
});
