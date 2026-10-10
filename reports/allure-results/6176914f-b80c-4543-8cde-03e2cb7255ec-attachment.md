# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: DataDrivenTest.spec.js >> login - problem_user
- Location: tests\DataDrivenTest.spec.js:6:8

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected: "https://www.saucedemo.com/"
Received: "https://www.saucedemo.com/inventory.html"
Timeout:  5000ms

Call log:
  - Expect "toHaveURL" with timeout 5000ms
    13 × locator resolved to <html lang="en">…</html>
       - unexpected value "https://www.saucedemo.com/inventory.html"

```

```yaml
- banner:
  - button "Open Menu"
  - img "Open Menu"
  - text: Swag Labs
  - button "Cart, empty"
  - text: Products Name (A to Z)
  - combobox "Sort products":
    - option "Name (A to Z)" [selected]
    - option "Name (Z to A)"
    - option "Price (low to high)"
    - option "Price (high to low)"
- main:
  - button "View details for Sauce Labs Backpack":
    - img "Sauce Labs Backpack"
  - button "View details for Sauce Labs Backpack": Sauce Labs Backpack
  - text: carry.allTheThings() with the sleek, streamlined Sly Pack that melds uncompromising style with unequaled laptop and tablet protection. $29.99
  - button "Add to cart"
  - button "View details for Sauce Labs Bike Light":
    - img "Sauce Labs Bike Light"
  - button "View details for Sauce Labs Bike Light": Sauce Labs Bike Light
  - text: A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included. $9.99
  - button "Add to cart"
  - button "View details for Sauce Labs Bolt T-Shirt":
    - img "Sauce Labs Bolt T-Shirt"
  - button "View details for Sauce Labs Bolt T-Shirt": Sauce Labs Bolt T-Shirt
  - text: Get your testing superhero on with the Sauce Labs bolt T-shirt. From American Apparel, 100% ringspun combed cotton, heather gray with red bolt. $15.99
  - button "Add to cart"
  - button "View details for Sauce Labs Fleece Jacket":
    - img "Sauce Labs Fleece Jacket"
  - button "View details for Sauce Labs Fleece Jacket": Sauce Labs Fleece Jacket
  - text: It's not every day that you come across a midweight quarter-zip fleece jacket capable of handling everything from a relaxing day outdoors to a busy day at the office. $49.99
  - button "Add to cart"
  - button "View details for Sauce Labs Onesie":
    - img "Sauce Labs Onesie"
  - button "View details for Sauce Labs Onesie": Sauce Labs Onesie
  - text: Rib snap infant onesie for the junior automation engineer in development. Reinforced 3-snap bottom closure, two-needle hemmed sleeved and bottom won't unravel. $7.99
  - button "Add to cart"
  - button "View details for Test.allTheThings() T-Shirt (Red)":
    - img "Test.allTheThings() T-Shirt (Red)"
  - button "View details for Test.allTheThings() T-Shirt (Red)": Test.allTheThings() T-Shirt (Red)
  - text: This classic Sauce Labs t-shirt is perfect to wear when cozying up to your keyboard to automate a few tests. Super-soft and comfy ringspun combed cotton. $15.99
  - button "Add to cart"
- contentinfo:
  - list:
    - listitem:
      - link "X":
        - /url: https://x.com/saucelabs
    - listitem:
      - link "Facebook":
        - /url: https://www.facebook.com/saucelabs
    - listitem:
      - link "LinkedIn":
        - /url: https://www.linkedin.com/company/sauce-labs/
  - text: © 2026 Sauce Labs. All Rights Reserved. Terms of Service | Privacy Policy
```

# Test source

```ts
  1  | import { expect, test } from "@playwright/test";
  2  | import users from "../test-data/users.json" with { type: "json" };
  3  | import { InventoryPage } from "../pages/Inventory";
  4  | 
  5  | for (const user of users) {
  6  |   test.only(`login - ${user.username}`, async ({ page }) => {
  7  |     await page.goto("https://www.saucedemo.com");
  8  | 
  9  |     await page.locator("#user-name").fill(user.username);
  10 | 
  11 |     await page.locator("#password").fill(user.password);
  12 | 
  13 |     await page.locator("#login-button").click();
  14 | 
  15 |     await page.waitForTimeout(2000);
  16 | 
  17 |     const inventory = new InventoryPage(page);
  18 | 
  19 |     if (user.logined === true) {
  20 |       await inventory.verifyPageTitle();
  21 |     } else {
> 22 |       await expect(page).toHaveURL("https://www.saucedemo.com/");
     |                          ^ Error: expect(page).toHaveURL(expected) failed
  23 |     }
  24 |   });
  25 | }
  26 | 
```