import { test, expect } from "../../fixtures/baseFixture.js";
import env from "../../config/env.config.js";
import { TITLES } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";

const productName = "Sauce Labs Backpack"; //sauce-labes-backpack

// Flow: sign in, add the backpack, and open the cart. Validates cart title, item count/name, and badge count.
test("cart displays a product added from inventory", async ({
  loginPage,
  inventoryPage,
  cartPage,
}) => {
  await loginPage.open();
  await loginPage.login(env.username, env.password);
  await inventoryPage.addProductToCart(productName);
  await inventoryPage.goToCart();

  await expect(cartPage.pageTitle).toHaveText(TITLES.YOUR_CART);
  await expect(cartPage.cartItems).toHaveCount(1);
  await expect(cartPage.cartItemNames).toHaveText(productName);
  expect(await cartPage.getCartCount()).toBe(1);

  logger.info(`Verified cart contains ${productName}`);
});
