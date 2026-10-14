📋 Manual Test Cases — SauceDemo (Automated Scenarios, Explained)

> Purpose: This document lists every scenario the framework automates, written as detailed manual test cases with step-by-step workflows, preconditions, test data, and expected results. Use it to (a) understand _what_ the automation verifies, (b) execute the same checks by hand for exploratory/UAT rounds, and (c) map manual test IDs to automated specs.
>
> Application Under Test (AUT): https://www.saucedemo.com
> Common password (all users): `secret_sauce`

---

📑 Table of Contents

1. [Test Environment & Preconditions](#1-test-environment--preconditions)
2. [Test User Accounts](#2-test-user-accounts)
3. [Test Case Summary Matrix](#3-test-case-summary-matrix)
4. [Module 1 — Login (Positive)](#module-1--login-positive)
5. [Module 2 — Login (Negative)](#module-2--login-negative)
6. [Module 3 — Logout](#module-3--logout)
7. [Module 4 — Inventory / Products](#module-4--inventory--products)
8. [Module 5 — Cart](#module-5--cart)
9. [Module 6 — Checkout](#module-6--checkout)
10. [Module 7 — End-to-End Purchase Journey](#module-7--end-to-end-purchase-journey)
11. [How to Execute These Tests](#how-to-execute-these-tests)
12. [Manual ↔ Automated Traceability](#manual--automated-traceability)

---

1. Test Environment & Preconditions

| Item     | Detail                                                                |
| -------- | --------------------------------------------------------------------- |
| URL      | https://www.saucedemo.com                                             |
| Browsers | Chrome / Firefox / Safari (automation runs Chromium, Firefox, WebKit) |
| Screen   | Desktop, 1366 × 768                                                   |
| Network  | Stable internet; SauceDemo reachable                                  |
| Data     | Uses the built-in demo accounts below — no setup needed               |

Global precondition for every test: the SauceDemo login page loads successfully at the base URL.

---

2. Test User Accounts

| User        | Username                  | Behavior                            |
| ----------- | ------------------------- | ----------------------------------- |
| Standard    | `standard_user`           | Works normally (happy path)         |
| Locked out  | `locked_out_user`         | Cannot log in — shows lockout error |
| Problem     | `problem_user`            | Logs in but has UI/product issues   |
| Performance | `performance_glitch_user` | Logs in with a noticeable delay     |

All use password `secret_sauce`.

---

3. Test Case Summary Matrix

| Module           | Test IDs                                                                               | Count | Priority |
| ---------------- | -------------------------------------------------------------------------------------- | ----- | -------- |
| Login (Positive) | TC_LOGIN_VALID, TC_LOGIN_PROBLEM, TC_LOGIN_PERF                                        | 3     | High     |
| Login (Negative) | TC_LOGIN_LOCKED, TC_LOGIN_01, TC_LOGIN_02, TC_LOGIN_04, TC_LOGIN_05                    | 5     | High     |
| Logout           | TC_LOGIN_LOGOUT                                                                        | 1     | Medium   |
| Inventory        | TC_INV_01 … TC_INV_11                                                                  | 11    | High     |
| Cart             | TC_CART_01 … TC_CART_08                                                                | 8     | High     |
| Checkout         | TC_CHECKOUT_01, _SUMMARY, _CANCEL, _BACKHOME, _CONFIRM_TEXT, _RANDOM, validation cases | 8+    | High     |
| E2E              | TC_E2E_01 … TC_E2E_04                                                                  | 4     | Critical |

---

Module 1 — Login (Positive)

TC_LOGIN_VALID — Valid standard user can log in `@smoke`

| Field        | Detail                                                               |
| ------------ | -------------------------------------------------------------------- |
| Objective    | Verify a valid standard user can log in and reach the Products page. |
| Precondition | Login page is displayed.                                             |
| Test Data    | Username: `standard_user`, Password: `secret_sauce`                  |
| Priority     | High                                                                 |

Workflow / Steps:

1. Open https://www.saucedemo.com
2. Enter `standard_user` in the Username field.
3. Enter `secret_sauce` in the Password field.
4. Click the Login button.

Expected Result:

- User is redirected to `/inventory.html`.
- The page title reads "Products".

---

TC_LOGIN_PROBLEM — Problem user can log in

| Field        | Detail                                                                                |
| ------------ | ------------------------------------------------------------------------------------- |
| Objective    | Verify the problem user can still authenticate (even though the UI has known issues). |
| Precondition | Login page is displayed.                                                              |
| Test Data    | Username: `problem_user`, Password: `secret_sauce`                                    |
| Priority     | Medium                                                                                |

Workflow / Steps:

1. Open the login page.
2. Enter `problem_user` and `secret_sauce`.
3. Click Login.

Expected Result:

- User lands on the inventory page (`/inventory.html`).

---

TC_LOGIN_PERF — Performance glitch user can log in

| Field        | Detail                                                                   |
| ------------ | ------------------------------------------------------------------------ |
| Objective    | Verify the performance-glitch user logs in successfully despite a delay. |
| Precondition | Login page is displayed.                                                 |
| Test Data    | Username: `performance_glitch_user`, Password: `secret_sauce`            |
| Priority     | Medium                                                                   |

Workflow / Steps:

1. Open the login page.
2. Enter `performance_glitch_user` and `secret_sauce`.
3. Click Login.
4. Wait for the page to finish loading (expect a delay).

Expected Result:

- Page title reads "Products" once the inventory page loads.

---

Module 2 — Login (Negative)

TC_LOGIN_LOCKED — Locked-out user sees lockout error `@smoke`

| Field     | Detail                                                                 |
| --------- | ---------------------------------------------------------------------- |
| Objective | Verify a locked-out account cannot log in and shows the correct error. |
| Test Data | Username: `locked_out_user`, Password: `secret_sauce`                  |
| Priority  | High                                                                   |

Workflow / Steps:

1. Open the login page.
2. Enter `locked_out_user` and `secret_sauce`.
3. Click Login.

Expected Result:

- Login is rejected; user stays on the login page.
- Error message: "Epic sadface: Sorry, this user has been locked out."

---

TC_LOGIN_01 — Invalid username

| Field     | Detail                                             |
| --------- | -------------------------------------------------- |
| Objective | Verify login fails with an unknown username.       |
| Test Data | Username: `invalid_user`, Password: `secret_sauce` |
| Priority  | High                                               |

Workflow / Steps:

1. Open the login page.
2. Enter `invalid_user` and `secret_sauce`.
3. Click Login.

Expected Result:

- Error: "Epic sadface: Username and password do not match any user in this service"

---

TC_LOGIN_02 — Invalid password

| Field     | Detail                                                     |
| --------- | ---------------------------------------------------------- |
| Objective | Verify login fails with a wrong password for a valid user. |
| Test Data | Username: `standard_user`, Password: `wrong_password`      |
| Priority  | High                                                       |

Workflow / Steps:

1. Open the login page.
2. Enter `standard_user` and `wrong_password`.
3. Click Login.

Expected Result:

- Error: "Epic sadface: Username and password do not match any user in this service"

---

TC_LOGIN_04 — Empty username

| Field     | Detail                                                                 |
| --------- | ---------------------------------------------------------------------- |
| Objective | Verify a required-field validation appears when the username is blank. |
| Test Data | Username: _(empty)_, Password: `secret_sauce`                          |
| Priority  | Medium                                                                 |

Workflow / Steps:

1. Open the login page.
2. Leave Username empty; enter `secret_sauce` in Password.
3. Click Login.

Expected Result:

- Error: "Epic sadface: Username is required"

---

TC_LOGIN_05 — Empty password

| Field     | Detail                                                                 |
| --------- | ---------------------------------------------------------------------- |
| Objective | Verify a required-field validation appears when the password is blank. |
| Test Data | Username: `standard_user`, Password: _(empty)_                         |
| Priority  | Medium                                                                 |

Workflow / Steps:

1. Open the login page.
2. Enter `standard_user`; leave Password empty.
3. Click Login.

Expected Result:

- Error: "Epic sadface: Password is required"

---

Module 3 — Logout

TC_LOGIN_LOGOUT — User can log out successfully

| Field        | Detail                                                                 |
| ------------ | ---------------------------------------------------------------------- |
| Objective    | Verify an authenticated user can log out and return to the login page. |
| Precondition | User is logged in as `standard_user`.                                  |
| Priority     | Medium                                                                 |

Workflow / Steps:

1. Log in as `standard_user` / `secret_sauce`.
2. Confirm the inventory page is displayed.
3. Click the ☰ (burger) menu button (top-left).
4. Click Logout.

Expected Result:

- User is returned to the login page (URL is the base `/`).
- The Login button is visible again.

---

Module 4 — Inventory / Products

Precondition for all TC_INV cases: user is logged in as `standard_user` and on the inventory page.

TC_INV_01 — Exactly 6 products are displayed `@smoke`
Steps: View the products grid.
Expected: Exactly 6 product cards are shown.

TC_INV_02 — Every product has a name, price and image
Steps: Inspect each of the 6 product cards.
Expected: Every card displays a name, a price, and an image (6 names, 6 prices, 6 images).

TC_INV_03 — All expected product names are present
Steps: Read all product names.
Expected: The displayed names match the full expected catalog (e.g. Sauce Labs Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Test.allTheThings() T-Shirt).

TC_INV_04 — Sort by Name (A → Z) `@smoke`
Steps: Select "Name (A to Z)" in the sort dropdown.
Expected: Products are ordered alphabetically ascending.

TC_INV_05 — Sort by Name (Z → A)
Steps: Select "Name (Z to A)".
Expected: Products are ordered alphabetically descending.

TC_INV_06 — Sort by Price (low → high)
Steps: Select "Price (low to high)".
Expected: Prices ascend from lowest to highest.

TC_INV_07 — Sort by Price (high → low)
Steps: Select "Price (high to low)".
Expected: Prices descend from highest to lowest.

TC_INV_08 — Add single product updates cart badge `@smoke`
Steps: Click Add to cart on "Sauce Labs Backpack".
Expected: Cart badge shows 1.

TC_INV_09 — Add multiple products updates cart badge
Steps: Add Backpack, Bike Light, and Onesie.
Expected: Cart badge shows 3.

TC_INV_10 — Remove product from inventory decreases badge
Steps: Add "Sauce Labs Backpack" (badge = 1), then click Remove.
Expected: Cart badge returns to 0 (badge disappears).

TC_INV_11 — Open product details page
Steps: Click a product name (e.g. "Sauce Labs Backpack").
Expected: The product detail page opens showing that product's name, description, price, and an Add to cart button.

TC_INV_12 — Open product details page
Steps: Click a product name (Product. "Sauce Labs Bike Light").
Expected: The product detail page opens showing that product's name, description, price, and an Add to cart button.

product pafe descrption-
Sauce Labs Bike Light
A red light isn't the desired state in testing but it sure helps when riding your bike at night. Water-resistant with 3 lighting modes, 1 AAA battery included.
$9.99Add to cart

---

Module 5 — Cart

Precondition for all TC_CART cases: user is logged in as `standard_user`.

TC_CART_01 — Cart badge reflects number of added items `@smoke`
Steps: Add "Sauce Labs Backpack" and "Sauce Labs Bike Light".
Expected: Cart badge shows 2.

TC_CART_02 — Added items appear in the cart
Steps: Add the two products above, then open the cart (click the cart icon).
Expected: Cart lists both product names; item count is 2.

TC_CART_03 — Cart page title is correct
Steps: Open the cart.
Expected: Page title reads "Your Cart".

TC_CART_04 — Remove item from the cart page
Steps: Add "Sauce Labs Backpack", open cart (count = 1), click Remove.
Expected: Cart item count becomes 0.

TC_CART_05 — Product price is correct in cart
Steps: Add "Sauce Labs Backpack", open the cart.
Expected: Its price shows as $29.99.

TC_CART_06 — Continue shopping returns to inventory
Steps: Open the cart, click Continue Shopping.
Expected: User returns to the inventory (`/inventory.html`).

TC_CART_07 — Items persist after continue shopping
Steps: Add "Sauce Labs Backpack", open cart, click Continue Shopping.
Expected: Cart badge still shows 1 (the item is retained).

TC_CART_08 — Checkout button navigates to checkout step one
Steps: Add "Sauce Labs Backpack", open cart, click Checkout.
Expected: The "Checkout: Your Information" page is displayed.

---

Module 6 — Checkout

Precondition for all checkout cases: user is logged in as `standard_user`, has added "Sauce Labs Backpack" to the cart, and has clicked Checkout (now on the Your Information step).

TC_CHECKOUT_01 — Complete order with valid customer info `@smoke`

| Field     | Detail                                            |
| --------- | ------------------------------------------------- |
| Objective | Verify a full checkout completes with valid data. |
| Test Data | First: `John`, Last: `Doe`, Zip: `12345`          |
| Priority  | High                                              |

Workflow / Steps:

1. On "Checkout: Your Information", enter First Name `John`, Last Name `Doe`, Zip/Postal Code `12345`.
2. Click Continue.
3. On "Checkout: Overview", click Finish.

Expected Result:

- The "Checkout: Complete!" page appears.
- Header reads "Thank you for your order!".

---

TC_CHECKOUT_SUMMARY — Order summary total = subtotal + tax

Workflow / Steps:

1. Fill valid info (`John` / `Doe` / `12345`) and click Continue.
2. On the overview page, read Item total (subtotal), Tax, and Total.

Expected Result:

- `Total` equals `Subtotal + Tax` (rounded to 2 decimals).

---

TC_CHECKOUT_CANCEL — Cancel on info step returns to cart

Workflow / Steps:

1. On "Checkout: Your Information", click Cancel.

Expected Result:

- User is returned to the "Your Cart" page.

---

TC_CHECKOUT_BACKHOME — Back Home after order returns to inventory

Workflow / Steps:

1. Complete an order (fill info → Continue → Finish).
2. On the confirmation page, click Back Home.

Expected Result:

- User returns to the inventory page.
- The cart is empty (badge shows 0).

---

TC_CHECKOUT_CONFIRM_TEXT — Confirmation text is displayed

Workflow / Steps:

1. Complete an order (fill info → Continue → Finish).
2. Read the confirmation body text.

Expected Result:

- Text reads: "Your order has been dispatched, and will arrive just as fast as the pony can get there!"

---

TC_CHECKOUT_RANDOM — Complete order with randomly generated customer data

Workflow / Steps:

1. Enter a randomly generated first name, last name, and postal code.
2. Click Continue → Finish.

Expected Result:

- Order completes successfully; confirmation page is shown.

---

Checkout Validation (Negative)

Precondition: on "Checkout: Your Information".

| Test ID        | First Name | Last Name | Zip       | Action         | Expected Error                 |
| -------------- | ---------- | --------- | --------- | -------------- | ------------------------------ |
| TC_CHECKOUT_10 | _(empty)_  | Doe       | 12345     | Click Continue | Error: First Name is required  |
| TC_CHECKOUT_11 | John       | _(empty)_ | 12345     | Click Continue | Error: Last Name is required   |
| TC_CHECKOUT_12 | John       | Doe       | _(empty)_ | Click Continue | Error: Postal Code is required |

---

Module 7 — End-to-End Purchase Journey

TC_E2E_01 — Full purchase journey, login to confirmation `@smoke` `@e2e`

| Field        | Detail                                                                                                     |
| ------------ | ---------------------------------------------------------------------------------------------------------- |
| Objective    | Validate the complete customer journey end to end in one continuous flow.                                  |
| Precondition | Login page displayed.                                                                                      |
| Test Data    | User `standard_user` / `secret_sauce`; Products: Backpack + Bike Light; Customer: `John` / `Doe` / `12345` |
| Priority     | Critical                                                                                                   |

Workflow / Steps:

1. Login — open the site, enter `standard_user` / `secret_sauce`, click Login. → Products page shown.
2. Sort & add — select Price (low to high), add "Sauce Labs Backpack" and "Sauce Labs Bike Light". → Cart badge = 2.
3. Verify cart — open the cart. → Title "Your Cart"; both items listed; count = 2.
4. Checkout info — click Checkout, enter `John` / `Doe` / `12345`, click Continue.
5. Verify totals — on the overview page, confirm `Subtotal + Tax = Total`.
6. Finish — click Finish. → "Checkout: Complete!" page; header "Thank you for your order!".
7. Back home — click Back Home. → Inventory page; cart empty (badge = 0).

Expected Result:

- Every step passes; the order is placed and the cart resets to empty.

---

TC_E2E_02 — Remove an item mid-journey and check out the rest

| Field        | Detail                                                                                                                              |
| ------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Objective    | Verify a user can drop a product during the journey and still complete checkout for the remaining items.                            |
| Precondition | Login page displayed.                                                                                                               |
| Test Data    | User `standard_user` / `secret_sauce`; Products: Backpack + Bike Light + Onesie (remove Onesie); Customer: `John` / `Doe` / `12345` |
| Priority     | High                                                                                                                                |

Workflow / Steps:

1. Login — enter `standard_user` / `secret_sauce`, click Login. → Products page shown.
2. Add three — add "Sauce Labs Backpack", "Sauce Labs Bike Light", "Sauce Labs Onesie". → Cart badge = 3.
3. Remove one — open the cart, click Remove on "Sauce Labs Onesie". → Cart count = 2; Onesie no longer listed.
4. Checkout — click Checkout, enter `John` / `Doe` / `12345`, click Continue, then Finish.

Expected Result:

- Order confirmation ("Checkout: Complete!") is shown for the two remaining items.

---

TC_E2E_03 — Reset app state mid-journey, then complete a fresh purchase

| Field        | Detail                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Objective    | Verify Reset App State clears the cart mid-journey and the user can still complete a new purchase afterwards.                         |
| Precondition | Login page displayed.                                                                                                                 |
| Test Data    | User `standard_user` / `secret_sauce`; Initial: Backpack + Bike Light; After reset: Fleece Jacket; Customer: `Jane` / `Doe` / `54321` |
| Priority     | Medium                                                                                                                                |

Workflow / Steps:

1. Login — enter `standard_user` / `secret_sauce`, click Login. → Products page shown.
2. Add two — add "Sauce Labs Backpack" and "Sauce Labs Bike Light". → Cart badge = 2.
3. Reset — open the burger menu, click Reset App State. → Cart badge cleared (0).
4. Fresh purchase — add "Sauce Labs Fleece Jacket" (badge = 1), open cart, Checkout, enter `Jane` / `Doe` / `54321`, Continue, Finish.

Expected Result:

- Cart is emptied by the reset; the subsequent order is placed and confirmed.

---

TC_E2E_04 — Two separate purchases in a single session

| Field        | Detail                                                                                                                                |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| Objective    | Verify a user can complete one order, return home, and complete a second independent order in the same login session.                 |
| Precondition | Login page displayed.                                                                                                                 |
| Test Data    | User `standard_user` / `secret_sauce`; Order 1: Backpack (`John` / `Doe` / `12345`); Order 2: Bike Light (`Jane` / `Smith` / `67890`) |
| Priority     | Medium                                                                                                                                |

Workflow / Steps:

1. Login — enter `standard_user` / `secret_sauce`, click Login. → Products page shown.
2. Order 1 — add "Sauce Labs Backpack", checkout with `John` / `Doe` / `12345`, Finish. → Order confirmed.
3. Back home — click Back Home. → Inventory page; cart badge = 0.
4. Order 2 — add "Sauce Labs Bike Light" (badge = 1), checkout with `Jane` / `Smith` / `67890`, Finish. → Order confirmed.

Expected Result:

- Both orders complete successfully; the cart resets between the two purchases.

---

How to Execute These Tests

Manually: follow the Workflow/Steps of each case in a browser at https://www.saucedemo.com and compare against the Expected Result.

Via automation (same scenarios):

```powershell
npm run test:login        # Login positive + negative + logout
npm run test:inventory    # Inventory / products
npm run test:cart         # Cart
npm run test:checkout     # Checkout
npm run test:e2e          # End-to-end purchase journey
npm run test:smoke        # All @smoke critical-path cases
npm test                  # Full suite, all browsers
```

View results:

```powershell
npm run report            # Playwright HTML report
npm run allure:serve      # Allure report
```

---

Manual ↔ Automated Traceability

| Manual Test ID                                  | Automated Spec                    |
| ----------------------------------------------- | --------------------------------- |
| TC_LOGIN_VALID, TC_LOGIN_PROBLEM, TC_LOGIN_PERF | tests/login/positiveLogin.spec.js |
| TC_LOGIN_LOCKED, TC_LOGIN_01/02/04/05           | tests/login/negativeLogin.spec.js |
| TC_LOGIN_LOGOUT                                 | tests/login/logout.spec.js        |
| TC_INV_01 … TC_INV_11                           | tests/inventory/inventory.spec.js |
| TC_CART_01 … TC_CART_08                         | tests/cart/cart.spec.js           |
| TC_CHECKOUT_*                                   | tests/checkout/checkout.spec.js   |
| TC_E2E_01 … TC_E2E_04                           | tests/e2e/purchaseJourney.spec.js |

> Note: Some checks (screenshots on failure and cross-browser runs) are automation-only quality gates and are not part of manual execution.
