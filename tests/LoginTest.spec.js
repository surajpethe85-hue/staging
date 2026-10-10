// import { test, expect } from "../fixtures/basefixture.js";
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage.js";
import { InventoryPage } from "../pages/Inventory.js";

test("Login Flow", async ({ page }) => {
  const login = new LoginPage(page);
  await login.open();
  await login.loginFlow();

  const inventory = new InventoryPage(page);
  await inventory.verifyPageTitle();

  await page.waitForTimeout(3000);
});
