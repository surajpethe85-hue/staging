import { test as base, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";
import env from "../config/env.config.js";
import LoginPage from "../pages/LoginPage.js";
import InventoryPage from "../pages/InventoryPage.js";
import CheckoutPage from "../pages/CheckoutPage.js";
import CheckoutCompletePage from "../pages/CheckoutCompletePage.js";
import CartPage from "../pages/CartPage.js";
import { logger } from "../utils/logger.js";

const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  /**
   * Auto-login fixture.
   * Logs in as the standard user and lands on the inventory page.
   * Use this in tests that require an authenticated state.
   */
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.username, env.password);
    await page.waitForURL(/inventory/);
    await use(page);
  },
});

/**
 * Global afterEach hook.
 * On failure, capture a full-page screenshot and:
 *   1. Save it to reports/failed-screenshots/ as a real .png file
 *   2. Attach it to the report (Allure / HTML) so debugging a failed
 *      run doesn't require re-running it.
 */
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    logger.warn(`Test failed: "${testInfo.title}" — capturing screenshot`);
    if (!page || page.isClosed()) {
      logger.warn("Skipping failure screenshot because the page is unavailable");
      return;
    }

    try {
      const screenshot = await page.screenshot({ fullPage: true });

      // 1) Save to the dedicated failed-screenshots folder
      const screenshotDir = path.resolve("reports/failed-screenshots");
      fs.mkdirSync(screenshotDir, { recursive: true });
      const safeTitle = testInfo.title
        .replace(/[^a-z0-9]+/gi, "_")
        .slice(0, 80);
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const filePath = path.join(
        screenshotDir,
        `${safeTitle}_${timestamp}.png`,
      );
      fs.writeFileSync(filePath, screenshot);
      logger.info(`Failure screenshot saved: ${filePath}`);

      // 2) Attach to the report
      await testInfo.attach("failure-screenshot", {
        body: screenshot,
        contentType: "image/png",
      });
    } catch (error) {
      logger.error(`Could not capture failure screenshot: ${error.message}`);
    }
  }
});
export { test, expect };
