import { test, expect } from "../../fixtures/baseFixture.js";
import env from "../../config/env.config.js";
import { TITLES, SORT_OPTIONS } from "../../utils/constants.js";

/**
 * Purchase Journey E2E Flow for learning
 * ---------------------------------------------------------------
 * This file intentionally shows the full customer journey in a simple,
 * readable sequence. It does not depend on a custom customer fixture.
 * The goal is to help students understand the real execution flow:
 * Login -> Products -> Cart -> Checkout -> Confirmation
 */
test.describe("E2E - Purchase Journey @e2e", () => {
  test("TC_E2E_01: student can follow the full purchase flow from login to confirmation @smoke", async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    const products = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

    await test.step("1. Open the application and log in", async () => {
      await loginPage.open();
      await loginPage.login(env.users.standard, env.password);
      await expect(inventoryPage.pageTitle).toHaveText(TITLES.PRODUCTS);
    });

    await test.step("2. Sort the list and add products to the cart", async () => {
      await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
      await inventoryPage.addMultipleProducts(products);
      expect(await inventoryPage.getCartCount()).toBe(products.length);
    });

    await test.step("3. Open cart and confirm selected items", async () => {
      await inventoryPage.goToCart();
      await expect(cartPage.pageTitle).toHaveText(TITLES.YOUR_CART);
      const names = await cartPage.getCartItemNames();
      for (const product of products) {
        expect(names).toContain(product);
      }
    });

    await test.step("4. Start checkout and enter customer details", async () => {
      await cartPage.proceedToCheckout();
      await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_INFO);
      await checkoutPage.fillCustomerInfo("John", "Doe", "12345");
      await checkoutPage.continue();
      await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_OVERVIEW);
    });

    await test.step("5. Complete order and verify confirmation", async () => {
      await checkoutPage.finish();
      await expect(checkoutCompletePage.pageTitle).toHaveText(
        TITLES.CHECKOUT_COMPLETE,
      );
      expect(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
    });

    await test.step("6. Return to home and confirm cart is empty", async () => {
      await checkoutCompletePage.backHome();
      await expect(inventoryPage.pageTitle).toHaveText(TITLES.PRODUCTS);
      expect(await inventoryPage.getCartCount()).toBe(0);
    });
  });
});
