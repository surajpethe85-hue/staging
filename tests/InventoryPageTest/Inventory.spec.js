import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import { SORT_OPTIONS, EXPECTED_PRODUCT_COUNT } from "../../utils/constants.js";

const productsData = readJSON("products.json");
//JIRA
test.describe("Inventory / Products Module @regression", () => {
  // All tests here need an authenticated session
  test.beforeEach(async ({ loggedInPage }) => {
    // loggedInPage fixture already logs in and lands on inventory page
    void loggedInPage;
  });

  test("TC_INV_01: exactly 6 products are displayed @smoke", async ({
    inventoryPage,
  }) => {
    expect(await inventoryPage.getProductCount()).toBe(EXPECTED_PRODUCT_COUNT);
  });

  test("TC_INV_02: every product has a name, price and image", async ({
    inventoryPage,
  }) => {
    const count = await inventoryPage.getProductCount();
    expect(await inventoryPage.count(inventoryPage.itemNames)).toBe(count);
    expect(await inventoryPage.count(inventoryPage.itemPrices)).toBe(count);
    expect(await inventoryPage.count(inventoryPage.itemImages)).toBe(count);
  });

  test("TC_INV_03: all expected product names are present", async ({
    inventoryPage,
  }) => {
    const names = await inventoryPage.getProductNames();
    const expectedNames = productsData.products.map((p) => p.name);
    await expect(names.sort()).toEqual(expectedNames.sort());
  });

  test("TC_INV_04: sort products Name A to Z @smoke", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.NAME_A_TO_Z);
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => a.localeCompare(b));
    expect(names).toEqual(sorted);
  });

  test("TC_INV_05: sort products Name Z to A", async ({ inventoryPage }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.NAME_Z_TO_A);
    const names = await inventoryPage.getProductNames();
    const sorted = [...names].sort((a, b) => b.localeCompare(a));
    expect(names).toEqual(sorted);
  });

  test("TC_INV_06: sort products Price low to high", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => a - b);
    expect(prices).toEqual(sorted);
  });

  test("TC_INV_07: sort products Price high to low", async ({
    inventoryPage,
  }) => {
    await inventoryPage.sortBy(SORT_OPTIONS.PRICE_HIGH_TO_LOW);
    const prices = await inventoryPage.getProductPrices();
    const sorted = [...prices].sort((a, b) => b - a);
    expect(prices).toEqual(sorted);
  });

  test("TC_INV_08: add single product updates cart badge @smoke", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    expect(await inventoryPage.getCartCount()).toBe(1);
  });

  test("TC_INV_09: add multiple products updates cart badge", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addMultipleProducts([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
      "Sauce Labs Onesie",
    ]);
    expect(await inventoryPage.getCartCount()).toBe(3);
  });

  test("TC_INV_10: remove product from inventory decreases badge", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addProductToCart("Sauce Labs Backpack");
    expect(await inventoryPage.getCartCount()).toBe(1);
    await inventoryPage.removeProductFromCart("Sauce Labs Backpack");
    expect(await inventoryPage.getCartCount()).toBe(0);
  });

  test("TC_INV_11: open product details page", async ({
    inventoryPage,
    page,
  }) => {
    await inventoryPage.openProductDetails("Sauce Labs Backpack");
    expect(page.url()).toContain("inventory-item.html");
    await expect(page.locator(".inventory_details_name")).toHaveText(
      "Sauce Labs Backpack",
    );
  });

  test("TC_INV_12: open Sauce Labs Bike Light details", async ({
    inventoryPage,
    page,
  }) => {
    await inventoryPage.openProductDetails("Sauce Labs Bike Light");

    await expect(page.locator(".inventory_details_name")).toHaveText(
      "Sauce Labs Bike Light",
    );
    await expect(page.locator(".inventory_details_desc")).toHaveText(
      "A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.",
    );
    await expect(page.locator(".inventory_details_price")).toHaveText("$9.99");
    await expect(
      page.getByRole("button", { name: "Add to cart" }),
    ).toBeVisible();
  });

  // Data-Driven: every product shows its expected price
  for (const product of productsData.products) {
    test(`TC_INV_14: "${product.name}" displays the correct price`, async ({
      inventoryPage,
    }) => {
      expect(await inventoryPage.getProductPrice(product.name)).toBe(
        product.price,
      );
    });
  }

  test("TC_INV_15: reset app state clears the cart badge", async ({
    inventoryPage,
  }) => {
    await inventoryPage.addMultipleProducts([
      "Sauce Labs Backpack",
      "Sauce Labs Bike Light",
    ]);
    expect(await inventoryPage.getCartCount()).toBe(2);
    await inventoryPage.resetAppState();
    expect(await inventoryPage.getCartCount()).toBe(0);
  });
});
