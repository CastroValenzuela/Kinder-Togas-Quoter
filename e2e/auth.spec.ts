import { test, expect } from "@playwright/test";

test.describe("Admin Authentication E2E", () => {
  test("should redirect/show login page when accessing dashboard unauthenticated", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    // Verify that the login form is shown since we are not logged in
    await expect(page.locator("text=Iniciar Sesión").first()).toBeVisible();
    await expect(page.locator('input[type="email"]').first()).toBeVisible();
    await expect(page.locator('input[type="password"]').first()).toBeVisible();
  });
});
