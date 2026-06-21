import { test, expect } from "@playwright/test";

test.describe("Kinder Togas Quoter - E2E Funnel Tests", () => {
  test.beforeEach(async ({ page }) => {
    // Forward browser console errors and exceptions to node console
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        console.error(`[Browser Console Error]: ${msg.text()}`);
      }
    });
    page.on("pageerror", (err) => {
      console.error(`[Browser JS Exception]: ${err.message}\nStack: ${err.stack}`);
    });

    // Set Playwright test flag to bypass turnstile captcha validation during DB save
    await page.addInitScript(() => {
      (window as any).__PLAYWRIGHT_TEST__ = true;
    });
    // Mock Supabase submit-quote edge function
    await page.route("**/functions/v1/submit-quote", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true }),
      });
    });

    // Navigate to the quoter app
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("should complete the quoting funnel successfully for Pre-school Rent service", async ({ page }) => {
    // --- STEP 1: Select Level ---
    // Check header
    await expect(page.locator("h2")).toContainText("¿Para qué nivel escolar?");
    
    // Click on Preescolar card
    await page.click('button[aria-label="Preescolar"]');

    // --- STEP 2: Select Service ---
    // Wait for Step 2 animation and check header
    await expect(page.locator("h2")).toContainText("¿Renta o venta?");
    
    // Click on Renta card
    await page.click('button[aria-label="Renta"]');

    // --- STEP 3: Configurator Step ---
    // Wait for Step 3 container to load
    await expect(page.locator("h2")).toContainText("Configura tu cotización");

    // Select Tijuana city
    await page.click('button:has-text("Tijuana")');

    // Set quantity of graduates
    // Locating input number field
    const qtyInput = page.locator('input[type="number"]');
    await qtyInput.fill("25");

    // Click "Continuar" button to proceed to Step 4
    await page.click('button:has-text("Continuar")');

    // --- STEP 4: Client Details Form ---
    await expect(page.locator("h2")).toContainText("Detalles de contacto");

    // Fill Institution name
    await page.fill('input#school', "Escuela de Prueba Playwright");

    // Fill Contact name
    await page.fill('input#contact', "QA Engineer Tester");

    // Fill Phone (needs exactly 10 digits to enable continue)
    await page.fill('input#phone', "6461234567");

    // Fill Email
    await page.fill('input#email', "qa-e2e@kindertogas.com");

    // Choose Date: Click calendar popover trigger
    await page.click('button#date');
    
    // Select first available (not disabled) day button in the day-picker calendar
    // React-day-picker v9 rendering: standard button elements under grid cells
    const dayButton = page.locator('.rdp-day_button:not([disabled]), button.rdp-day:not([disabled])').first();
    await dayButton.click();

    // Click "Finalizar y Generar Folio"
    await page.click('button:has-text("Finalizar y Generar Folio")');

    // --- STEP 5: Quote Summary Screen ---
    // Check that we reached the summary step
    await expect(page.locator("h2")).toContainText("Cotización Finalizada");

    // Verify correct data is displayed in the summary table
    const summaryTable = page.locator("div.order-1");
    await expect(summaryTable).toContainText("Escuela de Prueba Playwright");
    await expect(summaryTable).toContainText("Tijuana");
    await expect(summaryTable).toContainText("25");
    await expect(summaryTable).toContainText("Renta");

    // Verify Download PDF button is visible and active
    const downloadBtn = page.locator('button:has-text("Descargar mi Cotización")');
    await expect(downloadBtn).toBeVisible();
    await expect(downloadBtn).toBeEnabled();
  });
});
