import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import { TITLES, MESSAGES } from "../../utils/constants.js";
import dataGenerator from "../../utils/dataGenerator.js";

const checkoutData = readJSON("checkoutData.json");

test.describe("Checkout Module @regression", () => {
  // Log in and add a product before every checkout test
  test.beforeEach(async ({ loggedInPage, inventoryPage, cartPage }) => {
    void loggedInPage;
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    await inventoryPage.goToCart();
    await cartPage.proceedToCheckout();
  });

  // Data-Driven: valid customer information completes checkout
  for (const customer of checkoutData.validCustomers) {
    test(`${customer.testId}: complete order - ${customer.description} @smoke`, async ({
      checkoutPage,
      checkoutCompletePage,
    }) => {
      await test.step("Fill customer information and continue", async () => {
        await checkoutPage.fillCustomerInfo(
          customer.firstName,
          customer.lastName,
          customer.postalCode,
        );
        await checkoutPage.continue();
      });
      //Step() is used to divide the test into logical steps, making it easier to read and debug. Each step can have its own description and can be reported separately in the test results.
      await test.step("Verify overview page then finish order", async () => {
        await expect(checkoutPage.pageTitle).toHaveText(
          TITLES.CHECKOUT_OVERVIEW,
        );
        await checkoutPage.finish();
      });

      await test.step("Verify order confirmation", async () => {
        // Soft assertions: collect all failures instead of stopping at the first
        expect.soft(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
        expect
          .soft(await checkoutCompletePage.getHeaderText())
          .toBe(MESSAGES.ORDER_COMPLETE_HEADER);
      });
    });
  }

  // Data-Driven: invalid customer information shows validation errors
  for (const customer of checkoutData.invalidCustomers) {
    test(`${customer.testId}: validation - ${customer.description}`, async ({
      checkoutPage,
    }) => {
      await checkoutPage.fillCustomerInfo(
        customer.firstName,
        customer.lastName,
        customer.postalCode,
      );
      await checkoutPage.continue();
      expect(await checkoutPage.getErrorMessage()).toBe(customer.expectedError);
    });
  }

  test("TC_CHECKOUT_SUMMARY: order summary total = subtotal + tax", async ({
    checkoutPage,
  }) => {
    await checkoutPage.fillCustomerInfo("John", "Doe", "12345");
    await checkoutPage.continue();
    const subtotal = await checkoutPage.getSubtotal();
    const tax = await checkoutPage.getTax();
    const total = await checkoutPage.getTotal();
    expect(Number((subtotal + tax).toFixed(2))).toBe(total);
  });

  test("TC_CHECKOUT_CANCEL: cancel on info step returns to cart", async ({
    checkoutPage,
    cartPage,
  }) => {
    await checkoutPage.cancel();
    await expect(cartPage.pageTitle).toHaveText(TITLES.YOUR_CART);
  });

  test("TC_CHECKOUT_BACKHOME: back home after order returns to inventory", async ({
    checkoutPage,
    checkoutCompletePage,
    inventoryPage,
  }) => {
    await checkoutPage.fillCustomerInfo("John", "Doe", "12345");
    await checkoutPage.continue();
    await checkoutPage.finish();
    expect(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
    await checkoutCompletePage.backHome();
    // Soft assertions: verify both landing page and empty cart in one run
    expect.soft(await inventoryPage.isLoaded()).toBeTruthy();
    // Cart should be empty after a completed order
    expect.soft(await inventoryPage.getCartCount()).toBe(0);
  });

  test("TC_CHECKOUT_CONFIRM_TEXT: confirmation text is displayed", async ({
    checkoutPage,
    checkoutCompletePage,
  }) => {
    await checkoutPage.fillCustomerInfo("John", "Doe", "12345");
    await checkoutPage.continue();
    await checkoutPage.finish();
    expect(await checkoutCompletePage.getCompleteText()).toBe(
      MESSAGES.ORDER_COMPLETE_TEXT,
    );
  });

  test("TC_CHECKOUT_RANDOM: complete order with randomly generated customer data ", async ({
    checkoutPage,
    checkoutCompletePage,
  }) => {
    // Reusable data generator produces unique data every run
    const cust = dataGenerator.customer();
    await checkoutPage.fillCustomerInfo(
      cust.firstName,
      cust.lastName,
      cust.postalCode,
    );
    await checkoutPage.continue();
    await checkoutPage.finish();
    expect(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
  });
});
