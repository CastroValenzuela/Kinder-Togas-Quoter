import { test, expect } from "@playwright/test";

test.describe("Quoter Flow E2E", () => {
  test("should render the landing page and have title", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Kinder Togas/i);
  });

  test("should display level choices", async ({ page }) => {
    await page.goto("/");
    // Check that preescolar level selector is present
    await expect(page.locator("text=Preescolar")).toBeVisible();
    await expect(page.locator("text=Primaria")).toBeVisible();
  });
});
