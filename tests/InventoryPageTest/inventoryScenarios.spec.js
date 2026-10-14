import { test, expect } from "../../fixtures/baseFixture.js";
import env from "../../config/env.config.js";
import {
  EXPECTED_PRODUCT_COUNT,
  SORT_OPTIONS,
  TITLES,
} from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";

// Flow: sign in, check inventory contents, then sort by price ascending. Validates page title, product count, and displayed price order.
test("inventory page lists products and supports sorting", async ({
  loginPage,
  inventoryPage,
}) => {
  await loginPage.open();
  await loginPage.login(env.username, env.password);

  await expect(inventoryPage.pageTitle).toHaveText(TITLES.PRODUCTS);
  await expect(inventoryPage.inventoryItems).toHaveCount(
    EXPECTED_PRODUCT_COUNT,
  );

  await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
  const prices = await inventoryPage.getAllTexts(inventoryPage.itemPrices);
  /*
    [
    "$7.99",
    "$9.99",
    "$15.99",
    "$29.99",
    "$49.99"
]*/
  const numericPrices = prices.map((price) => Number(price.replace("$", "")));
  //Convert prices from String to Number - price.replace('$', '') - "7.99 "9.99" "15.99"
  //   // Convert to Number - 7.99
  expect(numericPrices).toEqual(
    [...numericPrices].sort((first, second) => first - second),
  );
  logger.info("Verified inventory products and ascending price sort");

  /*
    Let's break it down.

1. What is numericPrices?

Suppose:

const numericPrices = [29.99, 7.99, 15.99, 49.99];

This is the actual order from the UI.

2. What does ...numericPrices mean?
[...numericPrices]

The ... takes all elements from numericPrices and puts them into a new array.

So:

[...numericPrices]

becomes:

[29.99, 7.99, 15.99, 49.99]

But importantly, it is a new/copy array.

Think of it as:

numericPrices
     ↓
[29.99, 7.99, 15.99, 49.99]
     ↓
... spreads the values
     ↓
[29.99, 7.99, 15.99, 49.99]  ← new array
3. Why do we need ...?

Because .sort() changes the original array.

If you do:

numericPrices.sort((a, b) => a - b);

the original array becomes:

[7.99, 15.99, 29.99, 49.99]

Now you have lost the original UI order.

Instead:

[...numericPrices].sort((a, b) => a - b);

creates a copy first.

Original:

numericPrices
// [29.99, 7.99, 15.99, 49.99]

Copy + sort:

[...numericPrices].sort((a, b) => a - b)
// [7.99, 15.99, 29.99, 49.99]

The original remains unchanged.

4. What does sort((first, second) => first - second) do?

It sorts numbers in ascending order.

(first, second) => first - second

means:

If result < 0 → first comes before second
If result > 0 → second comes before first
If result = 0 → same position

For example:

[29, 7, 15].sort((first, second) => first - second);

Result:

[7, 15, 29]
5. Finally, what does expect() do?

Your code:

expect(numericPrices).toEqual(
    [...numericPrices].sort((first, second) => first - second)
);

means:

"Is the actual UI price array already equal to the same array after sorting it from low to high?"

Example:

numericPrices = [7, 15, 29];

Sorted copy:

[...numericPrices].sort((a, b) => a - b);

// [7, 15, 29]

Both are equal → ✅ PASS

But:

numericPrices = [29, 7, 15];

Sorted copy:

[7, 15, 29]

Not equal → ❌ FAIL*/
});

test("inventory page supports adding multiple products to the cart", async ({
  loginPage,
  inventoryPage,
  cartPage,
}) => {
  await loginPage.open();
  await loginPage.login(env.username, env.password);

  const productsToAdd = [
    "Sauce Labs Backpack",
    "Sauce Labs Bolt T-Shirt",
    "Sauce Labs Onesie",
  ];
  await inventoryPage.addMultipleProducts(productsToAdd);

  await expect(inventoryPage.cartBadge).toHaveText(
    productsToAdd.length.toString(),
  );

  await inventoryPage.goToCart();
  const cartProductNames = await cartPage.getCartItemNames();
  expect(cartProductNames).toEqual(productsToAdd);
  logger.info(`Verified ${productsToAdd.length} products in the cart`);
});
