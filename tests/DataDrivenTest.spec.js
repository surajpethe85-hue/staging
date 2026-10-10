import { expect, test } from "@playwright/test";
import users from "../test-data/users.json" with { type: "json" };
import { InventoryPage } from "../pages/Inventory";

for (const user of users) {
  test(`login - ${user.username}`, async ({ page }) => {
    await page.goto("https://www.saucedemo.com");

    await page.locator("#user-name").fill(user.username);

    await page.locator("#password").fill(user.password);

    await page.locator("#login-button").click();

    await page.waitForTimeout(2000);

    const inventory = new InventoryPage(page);

    if (user.logined === true) {
      await inventory.verifyPageTitle();
    } else {
      await expect(page).toHaveURL("https://www.saucedemo.com/");
    }
  });
}
