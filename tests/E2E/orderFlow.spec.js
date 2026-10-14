import { test, expect } from "../../fixtures/baseFixture.js";
import env from "../../config/env.config.js";
import { MESSAGES } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";
// import users from "../../test-data/users.json" with { type: "json" };

const productName = "Sauce Labs Backpack";

// Flow: exercise the full journey from login through cart and checkout to confirmation. Validates the confirmation message and Back Home button.
test("user can complete an order from login to confirmation", async ({
  loginPage,
  inventoryPage,
  cartPage,
  checkoutPage,
  checkoutCompletePage,
}) => {
  await loginPage.open();
  await loginPage.login(env.users.standard, env.password);
  await inventoryPage.addProductToCart(productName);
  await inventoryPage.goToCart();
  await cartPage.proceedToCheckout();

  await checkoutPage.fillCustomerInfo("Ranjeet", "Kendre", "411001");
  await checkoutPage.continue();

  await checkoutPage.finish();

  await expect(checkoutCompletePage.completeHeader).toHaveText(
    MESSAGES.ORDER_COMPLETE_HEADER,
  );
  await expect(checkoutCompletePage.backHomeButton).toBeVisible();
  logger.info("Verified end-to-end order completion");
});
