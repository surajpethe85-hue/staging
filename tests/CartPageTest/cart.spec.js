import { test, expect } from "../../fixtures/baseFixture.js";
import { TITLES } from "../../utils/constants.js";

test.describe("Cart Module @regression", () => {
  test.beforeEach(async ({ loggedInPage }) => {
    void loggedInPage;
  });

  test("TC_CART_01: cart badge reflects number of added items @smoke", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addMultipleProducts([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);
    expect(await inventoryPage.getCartCount()).toBe(2);
  });

  test("TC_CART_02: added items appear in the cart", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addMultipleProducts([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);

    await inventoryPage.goToCart();
    const names = await cartPage.getCartItemNames();
    expect(names).toContain("Sauce Labs Backpack");
    expect(names).toContain("Sauce Labs Bike Light");
    expect(await cartPage.getItemCount()).toBe(2);
  });

  test("TC_CART_03: cart page title is correct", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goToCart();
    await expect(cartPage.pageTitle).toHaveText(TITLES.YOUR_CART);
  });

  test("TC_CART_04: remove item from the cart page", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await expect(cartPage.cartItems).toHaveCount(1);
    await cartPage.removeItem("Sauce Labs Backpack");
    await expect(cartPage.cartItems).toHaveCount(0);
  });

  test("TC_CART_05: product price is correct in cart", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    const prices = await cartPage.getCartItemPrices();
    expect(prices).toContain(29.99);
  });

  test("TC_CART_06: continue shopping returns to inventory", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    expect(await inventoryPage.isLoaded()).toBeTruthy();
  });

  test("TC_CART_07: items persist after continue shopping", async ({
    inventoryPage,
    cartPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartPage.continueShopping();
    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test("TC_CART_08: checkout button navigates to checkout step one", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_INFO);
  });


  test("TC_CART_09: checkout button navigates to checkout step one", async ({
    inventoryPage,
    cartPage,
    checkoutPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
    await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_INFO);

    await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_INFO);
  });
});


//retries: 2

// Execution failed: Failed
// rexecute the tests. - pass

//selenium webdriver
//ITestAnalyzer
