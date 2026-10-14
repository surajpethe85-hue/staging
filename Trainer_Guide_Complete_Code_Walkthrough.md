🧑‍💻 Complete Code Walkthrough — Build the Framework Live (Full Source, Step by Step)

> Companion to `Trainer_Guide_Build_Framework_StepByStep.md`.
> That guide explains the _why_ and teaching flow. This document gives you the complete, copy-ready source code for every step, in exact build order, from an empty folder to the final suite run. Nothing here is abbreviated — every file is shown in full so you can build it live with confidence.
>
> All code below is the real framework code. Type it live; keep this open as your answer key.

---

📑 Build Order (each step = one file or set of files)

| Step | What you create                 | Folder/File                                                                                                                                                                                   |
| ---- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0    | Project init + install          | `package.json`, `node_modules`                                                                                                                                                                |
| 1    | Minimal config + first raw test | `playwright.config.js`, `tests/login/positiveLogin.spec.js`                                                                                                                                   |
| 2    | Constants (kill magic strings)  | `utils/constants.js`                                                                                                                                                                          |
| 3    | Logger                          | `utils/logger.js`                                                                                                                                                                             |
| 4    | BasePage (parent class)         | `pages/BasePage.js`                                                                                                                                                                           |
| 5    | Page Objects                    | `pages/LoginPage.js`, `InventoryPage.js`, `CartPage.js`, `CheckoutPage.js`, `CheckoutCompletePage.js`                                                                                         |
| 6    | Environment config              | `config/environments/*.json`, `config/env.config.js`, `.env.example`                                                                                                                          |
| 7    | Wire config into Playwright     | `playwright.config.js` (final)                                                                                                                                                                |
| 8    | Utilities                       | `utils/stringUtils.js`, `waitUtils.js`, `dataGenerator.js`, `dataReader.js`, `assertionUtils.js`, `dateUtils.js`, `fileUtils.js`                                                              |
| 9    | Fixtures                        | `fixtures/baseFixture.js`                                                                                                                                                                     |
| 10   | Test data                       | `test-data/*.json`                                                                                                                                                                            |
| 11   | Data-driven & module specs      | `tests/login/negativeLogin.spec.js`, `logout.spec.js`, `tests/inventory/inventory.spec.js`, `tests/cart/cart.spec.js`, `tests/checkout/checkout.spec.js`, `tests/e2e/purchaseJourney.spec.js` |
| 12   | Reporting + global setup        | `global-setup.js`, reporters in config                                                                                                                                                        |
| 14   | Advanced tests                  | `tests/unit`                                                                                                                                                                                  |
| 15   | CI/CD                           | `.github/workflows/playwright.yml`, `Jenkinsfile`                                                                                                                                             |
| 16   | Final run + reports             | commands                                                                                                                                                                                      |

---

STEP 0 — Project Initialization

```powershell
mkdir saucedemo-framework
cd saucedemo-framework
npm init -y
npm install -D @playwright/test
npx playwright install
```

Then open `package.json` and add `"type": "module"` so we can use `import/export`. (We'll fill in all scripts at Step 15 — for now just this line.)

```json
{
  "name": "saucedemo-ui-framework",
  "version": "1.0.0",
  "type": "module"
}
```

---

STEP 1 — Minimal Config + First Raw Test

`playwright.config.js` (minimal — we grow it in Step 7)

```javascript
import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  use: {
    baseURL: "https://www.saucedemo.com",
    headless: true,
  },
});
```

`tests/login/positiveLogin.spec.js` (deliberately raw — refactored in Step 5)

```javascript
import { test, expect } from "@playwright/test";

test("valid user can log in", async ({ page }) => {
  await page.goto("/");
  await page.fill("#user-name", "standard_user");
  await page.fill("#password", "secret_sauce");
  await page.click("#login-button");
  await expect(page.locator(".title")).toHaveText("Products");
});
```

Run it:

```powershell
npx playwright test
npx playwright show-report
```

> 🎤 Say to class: _"It works — but the selectors and URL are hard-coded. If the login button changes, we edit every test. Let's fix that."_

---

STEP 2 — Constants (Kill Magic Strings)

`utils/constants.js` — COMPLETE

```javascript
/**
 * Application-wide constants: URLs, messages, and static text.
 * Keeping these in one place avoids magic strings across the framework.
 */

const ROUTES = {
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
  CHECKOUT_STEP_TWO: "/checkout-step-two.html",
  CHECKOUT_COMPLETE: "/checkout-complete.html",
};

const MESSAGES = {
  LOCKED_OUT: "Epic sadface: Sorry, this user has been locked out.",
  USERNAME_REQUIRED: "Epic sadface: Username is required",
  PASSWORD_REQUIRED: "Epic sadface: Password is required",
  INVALID_CREDENTIALS:
    "Epic sadface: Username and password do not match any user in this service",
  FIRST_NAME_REQUIRED: "Error: First Name is required",
  LAST_NAME_REQUIRED: "Error: Last Name is required",
  POSTAL_CODE_REQUIRED: "Error: Postal Code is required",
  ORDER_COMPLETE_HEADER: "Thank you for your order!",
  ORDER_COMPLETE_TEXT:
    "Your order has been dispatched, and will arrive just as fast as the pony can get there!",
};

const SORT_OPTIONS = {
  NAME_A_TO_Z: "az",
  NAME_Z_TO_A: "za",
  PRICE_LOW_TO_HIGH: "lohi",
  PRICE_HIGH_TO_LOW: "hilo",
};

const TITLES = {
  PRODUCTS: "Products",
  YOUR_CART: "Your Cart",
  CHECKOUT_INFO: "Checkout: Your Information",
  CHECKOUT_OVERVIEW: "Checkout: Overview",
  CHECKOUT_COMPLETE: "Checkout: Complete!",
};

const EXPECTED_PRODUCT_COUNT = 6;

export { ROUTES, MESSAGES, SORT_OPTIONS, TITLES, EXPECTED_PRODUCT_COUNT };
```

---

STEP 3 — Logger (Winston)

Install it: `npm install -D winston`

`utils/logger.js` — COMPLETE

```javascript
import { createLogger, format, transports } from "winston";
import env from "../config/env.config.js";

const { combine, timestamp, printf, colorize, errors } = format;

// Custom log line format: 2026-07-26 10:00:00 [INFO] message
const logFormat = printf(({ level, message, timestamp: ts, stack }) => {
  return `${ts} [${level.toUpperCase()}] ${stack || message}`;
});

/**
 * Central Winston logger used across the framework.
 * Logs to the console and to logs/test-execution.log.
 */
const logger = createLogger({
  level: env.logLevel,
  format: combine(
    errors({ stack: true }),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat,
  ),
  transports: [
    new transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        logFormat,
      ),
    }),
    new transports.File({ filename: "logs/test-execution.log" }),
    new transports.File({ filename: "logs/error.log", level: "error" }),
  ],
});

export default logger;
```

> ⚠️ `logger.js` imports `env` (Step 6). If you build strictly top-to-bottom, temporarily hard-code `level: 'info'` and remove the `env` import, then restore it after Step 6. In class, mention this dependency so students understand load order.

---

STEP 4 — BasePage (Parent Class, Inheritance + OOP)

`pages/BasePage.js` — COMPLETE

```javascript
import logger from "../utils/logger.js";

/**
 * BasePage - parent class for all Page Objects.
 * Contains reusable, generic wrappers around Playwright actions
 * so that child pages stay clean and DRY.
 */
class BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    this.page = page;
  }

  /* ===== NAVIGATION ===== */

  async goto(path = "/") {
    logger.info(`Navigating to: ${path}`);
    await this.page.goto(path);
  }

  async reload() {
    logger.info("Reloading page");
    await this.page.reload();
  }

  async goBack() {
    await this.page.goBack();
  }

  async goForward() {
    await this.page.goForward();
  }

  /* ===== CORE INTERACTIONS ===== */

  async click(locator) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    await element.click();
    logger.info(`Clicked element: ${this._describe(locator)}`);
  }

  async forceClick(locator) {
    await this._resolve(locator).click({ force: true });
    logger.info(`Force clicked: ${this._describe(locator)}`);
  }

  async doubleClick(locator) {
    await this._resolve(locator).dblclick();
    logger.info(`Double clicked: ${this._describe(locator)}`);
  }

  async rightClick(locator) {
    await this._resolve(locator).click({ button: "right" });
    logger.info(`Right clicked: ${this._describe(locator)}`);
  }

  async type(locator, text, delay = 50) {
    await this._resolve(locator).pressSequentially(text, { delay });
    logger.info(`Typed "${text}" into: ${this._describe(locator)}`);
  }

  async clear(locator) {
    await this._resolve(locator).clear();
  }

  async pressKey(locator, key) {
    await this._resolve(locator).press(key);
    logger.info(`Pressed "${key}" on: ${this._describe(locator)}`);
  }

  async hover(locator) {
    await this._resolve(locator).hover();
    logger.info(`Hovered over: ${this._describe(locator)}`);
  }

  async dragAndDrop(source, target) {
    await this._resolve(source).dragTo(this._resolve(target));
    logger.info(
      `Dragged ${this._describe(source)} to ${this._describe(target)}`,
    );
  }

  /* ===== CHECKBOX / RADIO ===== */

  async check(locator) {
    await this._resolve(locator).check();
    logger.info(`Checked: ${this._describe(locator)}`);
  }

  async uncheck(locator) {
    await this._resolve(locator).uncheck();
    logger.info(`Unchecked: ${this._describe(locator)}`);
  }

  async isChecked(locator) {
    return this._resolve(locator).isChecked();
  }

  /* ===== FILE UPLOAD ===== */

  async uploadFile(locator, filePaths) {
    await this._resolve(locator).setInputFiles(filePaths);
    logger.info(`Uploaded file(s): ${filePaths}`);
  }

  /* ===== INPUT ===== */

  async fill(locator, text) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    await element.fill(text);
    logger.info(`Filled "${text}" into: ${this._describe(locator)}`);
  }

  /* ===== READ / STATE ===== */

  async getText(locator) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    return (await element.innerText()).trim();
  }

  async getAllTexts(locator) {
    const element = this._resolve(locator);
    return (await element.allInnerTexts()).map((t) => t.trim());
  }

  async getValue(locator) {
    return this._resolve(locator).inputValue();
  }

  async getAttribute(locator, attribute) {
    return this._resolve(locator).getAttribute(attribute);
  }

  async getUrl() {
    return this.page.url();
  }

  async getTitle() {
    return this.page.title();
  }

  async isVisible(locator) {
    return this._resolve(locator).isVisible();
  }

  async isEnabled(locator) {
    return this._resolve(locator).isEnabled();
  }

  async count(locator) {
    return this._resolve(locator).count();
  }

  /* ===== DROPDOWNS ===== */

  async selectByValue(locator, value) {
    await this._resolve(locator).selectOption(value);
    logger.info(`Selected value "${value}" in: ${this._describe(locator)}`);
  }

  async selectByLabel(locator, label) {
    await this._resolve(locator).selectOption({ label });
  }

  /* ===== WAITS ===== */

  async waitForVisible(locator, timeout = 10000) {
    await this._resolve(locator).waitFor({ state: "visible", timeout });
  }

  async waitForHidden(locator, timeout = 10000) {
    await this._resolve(locator).waitFor({ state: "hidden", timeout });
  }

  /* ===== PRIVATE HELPERS ===== */

  /**
   * Accept a string selector OR a Locator and always return a Locator.
   * This is the polymorphic helper that lets every method above accept both.
   * @private
   */
  _resolve(locator) {
    return typeof locator === "string" ? this.page.locator(locator) : locator;
  }

  /**
   * Produce a short description of a locator for logging.
   * @private
   */
  _describe(locator) {
    return typeof locator === "string" ? locator : locator.toString();
  }
}

export default BasePage;
```

> 🎤 Teach the 4 OOP pillars here: Inheritance (children `extends BasePage`), Encapsulation (locators live in children), Polymorphism (`_resolve` accepts string or Locator), Abstraction (tests never touch raw Playwright).

---

STEP 5 — Page Objects (Extend BasePage)

`pages/LoginPage.js` — COMPLETE

```javascript
import { test } from "@playwright/test";
import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import logger from "../utils/logger.js";

/**
 * LoginPage - Page Object for the SauceDemo login screen.
 * Demonstrates a MIX of locator strategies: built-in, CSS, XPath.
 */
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.getByPlaceholder("Username"); // built-in
    this.passwordInput = page.locator("#password"); // CSS
    this.loginButton = page.getByRole("button", { name: "Login" }); // role
    this.errorMessage = page.locator('[data-test="error"]'); // CSS attr
    this.errorButton = page.locator("//button[@class='error-button']"); // XPath
    this.loginLogo = page.locator("//div[@class='login_logo']"); // XPath
  }

  async open() {
    await this.goto(ROUTES.LOGIN);
  }

  async login(username, password) {
    await test.step(`Login as "${username}"`, async () => {
      logger.info(`Attempting login with username: ${username}`);
      await this.fill(this.usernameInput, username);
      await this.fill(this.passwordInput, password);
      await this.click(this.loginButton);
    });
  }

  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  async hasError() {
    return this.isVisible(this.errorMessage);
  }
}

export default LoginPage;
```

`pages/InventoryPage.js` — COMPLETE

```javascript
import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import { slugify, parsePrice } from "../utils/stringUtils.js";
import logger from "../utils/logger.js";

/**
 * InventoryPage - Page Object for the products listing page.
 */
class InventoryPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator(".title");
    this.inventoryItems = page.locator(".inventory_item");
    this.itemNames = page.locator(".inventory_item_name");
    this.itemPrices = page.locator(".inventory_item_price");
    this.itemImages = page.locator("//div[@class='inventory_item_img']//img");
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator(".shopping_cart_badge");
    this.cartLink = page.locator("//a[@class='shopping_cart_link']");
    this.menuButton = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.getByRole("link", { name: "Logout" });
  }

  addToCartButton(productName) {
    return this.page.locator(
      `[data-test="add-to-cart-${this._toId(productName)}"]`,
    );
  }

  removeButton(productName) {
    return this.page.locator(`[data-test="remove-${this._toId(productName)}"]`);
  }

  async addProductToCart(productName) {
    logger.info(`Adding product to cart: ${productName}`);
    await this.click(this.addToCartButton(productName));
  }

  async removeProductFromCart(productName) {
    logger.info(`Removing product from cart: ${productName}`);
    await this.click(this.removeButton(productName));
  }

  async addMultipleProducts(productNames = []) {
    for (const name of productNames) {
      await this.addProductToCart(name);
    }
  }

  async getProductCount() {
    return this.count(this.inventoryItems);
  }

  async getProductNames() {
    return this.getAllTexts(this.itemNames);
  }

  async getProductPrices() {
    const priceStrings = await this.getAllTexts(this.itemPrices);
    return priceStrings.map((p) => parsePrice(p));
  }

  async sortBy(sortValue) {
    logger.info(`Sorting products by: ${sortValue}`);
    await this.selectByValue(this.sortDropdown, sortValue);
  }

  async getCartCount() {
    if (await this.isVisible(this.cartBadge)) {
      return parseInt(await this.getText(this.cartBadge), 10);
    }
    return 0;
  }

  async goToCart() {
    await this.click(this.cartLink);
  }

  async openProductDetails(productName) {
    logger.info(`Opening product details: ${productName}`);
    await this.click(this.itemNames.filter({ hasText: productName }));
  }

  async logout() {
    logger.info("Logging out");
    await this.click(this.menuButton);
    await this.click(this.logoutLink);
  }

  async isLoaded() {
    return this.getUrl().includes(ROUTES.INVENTORY);
  }

  _toId(productName) {
    return slugify(productName);
  }
}

export default InventoryPage;
```

`pages/CartPage.js` — COMPLETE

```javascript
import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import { slugify, parsePrice } from "../utils/stringUtils.js";
import logger from "../utils/logger.js";

/**
 * CartPage - Page Object for the shopping cart page.
 */
class CartPage extends BasePage {
  constructor(page) {
    super(page);
    this.pageTitle = page.locator(".title");
    this.cartItems = page.locator(".cart_item");
    this.cartItemNames = page.locator(".inventory_item_name");
    this.cartItemPrices = page.locator(".inventory_item_price");
    this.checkoutButton = page.getByRole("button", { name: "Checkout" });
    this.continueShoppingButton = page.getByRole("button", {
      name: "Continue Shopping",
    });
    this.cartBadge = page.locator("//span[@class='shopping_cart_badge']");
  }

  removeButton(productName) {
    return this.page.locator(`[data-test="remove-${slugify(productName)}"]`);
  }

  async open() {
    await this.goto(ROUTES.CART);
  }

  async getItemCount() {
    return this.count(this.cartItems);
  }

  async getCartItemNames() {
    return this.getAllTexts(this.cartItemNames);
  }

  async getCartItemPrices() {
    const priceStrings = await this.getAllTexts(this.cartItemPrices);
    return priceStrings.map((p) => parsePrice(p));
  }

  async removeItem(productName) {
    logger.info(`Removing item from cart: ${productName}`);
    await this.click(this.removeButton(productName));
  }

  async proceedToCheckout() {
    await this.click(this.checkoutButton);
  }

  async continueShopping() {
    await this.click(this.continueShoppingButton);
  }

  async getCartCount() {
    if (await this.isVisible(this.cartBadge)) {
      return parseInt(await this.getText(this.cartBadge), 10);
    }
    return 0;
  }
}

export default CartPage;
```

`pages/CheckoutPage.js` — COMPLETE

```javascript
import BasePage from "./BasePage.js";
import { parsePrice } from "../utils/stringUtils.js";
import logger from "../utils/logger.js";

/**
 * CheckoutPage - Page Object for checkout step one (info)
 * and step two (overview).
 */
class CheckoutPage extends BasePage {
  constructor(page) {
    super(page);
    // Step One - Your Information
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.postalCodeInput = page.getByPlaceholder("Zip/Postal Code");
    this.continueButton = page.locator('[data-test="continue"]');
    this.cancelButton = page.locator("//button[@data-test='cancel']");
    this.errorMessage = page.locator('[data-test="error"]');
    // Step Two - Overview
    this.finishButton = page.getByRole("button", { name: "Finish" });
    this.summarySubtotal = page.locator(
      "//div[@class='summary_subtotal_label']",
    );
    this.summaryTax = page.locator("//div[@class='summary_tax_label']");
    this.summaryTotal = page.locator("//div[@class='summary_total_label']");
    this.cartItemPrices = page.locator(".inventory_item_price");
    this.pageTitle = page.locator(".title");
  }

  async fillCustomerInfo(firstName, lastName, postalCode) {
    logger.info(
      `Filling checkout info: ${firstName} ${lastName}, ${postalCode}`,
    );
    if (firstName !== undefined && firstName !== "") {
      await this.fill(this.firstNameInput, firstName);
    }
    if (lastName !== undefined && lastName !== "") {
      await this.fill(this.lastNameInput, lastName);
    }
    if (postalCode !== undefined && postalCode !== "") {
      await this.fill(this.postalCodeInput, postalCode);
    }
  }

  async continue() {
    await this.click(this.continueButton);
  }

  async cancel() {
    await this.click(this.cancelButton);
  }

  async finish() {
    await this.click(this.finishButton);
  }

  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  async getSubtotal() {
    return parsePrice(await this.getText(this.summarySubtotal));
  }

  async getTax() {
    return parsePrice(await this.getText(this.summaryTax));
  }

  async getTotal() {
    return parsePrice(await this.getText(this.summaryTotal));
  }
}

export default CheckoutPage;
```

`pages/CheckoutCompletePage.js` — COMPLETE

```javascript
import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";

/**
 * CheckoutCompletePage - Page Object for the order confirmation page.
 */
class CheckoutCompletePage extends BasePage {
  constructor(page) {
    super(page);
    // XPath locator for the confirmation header
    this.completeHeader = page.locator("//h2[@class='complete-header']");
    // CSS locator
    this.completeText = page.locator(".complete-text");
    // Built-in role locator
    this.backHomeButton = page.getByRole("button", { name: "Back Home" });
    // XPath locator for the pony express image
    this.ponyExpressImage = page.locator("//img[@class='pony_express']");
  }

  async getHeaderText() {
    return this.getText(this.completeHeader);
  }

  async getCompleteText() {
    return this.getText(this.completeText);
  }

  async backHome() {
    await this.click(this.backHomeButton);
  }

  async isOrderComplete() {
    return (
      this.getUrl().includes(ROUTES.CHECKOUT_COMPLETE) &&
      (await this.isVisible(this.completeHeader))
    );
  }
}

export default CheckoutCompletePage;
```

Now refactor the Step 1 test to use the Page Object (final version shown in Step 11).

---

STEP 6 — Environment Configuration

Install dotenv: `npm install -D dotenv`

`config/environments/qa.json`

```json
{
  "name": "qa",
  "baseURL": "https://www.saucedemo.com",
  "credentials": {
    "password": "secret_sauce",
    "users": {
      "standard": "standard_user",
      "lockedOut": "locked_out_user",
      "problem": "problem_user",
      "performance": "performance_glitch_user",
      "error": "error_user"
    }
  }
}
```

Create `dev.json` and `staging.json` with the same shape (change `name` and, if needed, URLs).

`config/env.config.js` — COMPLETE

```javascript
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Centralized environment configuration.
 * Selection order: process.env.ENV -> config/environments/<ENV>.json
 *   -> individual .env vars -> hard-coded fallbacks.
 */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ENV_NAME = process.env.ENV || "qa";

function loadEnvFile() {
  const filePath = path.join(__dirname, "environments", `${ENV_NAME}.json`);
  if (fs.existsSync(filePath)) {
    return JSON.parse(fs.readFileSync(filePath, "utf-8"));
  }
  console.warn(
    `[env.config] No environment file for "${ENV_NAME}", using defaults.`,
  );
  return {};
}

const fileConfig = loadEnvFile();
const fileCreds = fileConfig.credentials || {};
const fileUsers = fileCreds.users || {};

const env = {
  name: fileConfig.name || ENV_NAME,
  baseURL:
    process.env.BASE_URL || fileConfig.baseURL || "https://www.saucedemo.com",
  password: process.env.PASSWORD || fileCreds.password || "secret_sauce",
  users: {
    standard:
      process.env.STANDARD_USER || fileUsers.standard || "standard_user",
    lockedOut:
      process.env.LOCKED_OUT_USER || fileUsers.lockedOut || "locked_out_user",
    problem: process.env.PROBLEM_USER || fileUsers.problem || "problem_user",
    performance:
      process.env.PERFORMANCE_USER ||
      fileUsers.performance ||
      "performance_glitch_user",
    error: process.env.ERROR_USER || fileUsers.error || "error_user",
  },
  timeouts: {
    test: Number(process.env.TEST_TIMEOUT) || 60000,
    expect: Number(process.env.EXPECT_TIMEOUT) || 10000,
    action: Number(process.env.ACTION_TIMEOUT) || 15000,
    navigation: Number(process.env.NAVIGATION_TIMEOUT) || 30000,
  },
  headless: process.env.HEADLESS !== "false",
  logLevel: process.env.LOG_LEVEL || "info",
};

export default env;
```

`.env.example` (commit this) + `.env` (git-ignored)

```bash
# Environment selection
ENV=qa

# Application
BASE_URL=https://www.saucedemo.com
PASSWORD=secret_sauce

# Execution
HEADLESS=true
LOG_LEVEL=info

# Timeouts (ms)
TEST_TIMEOUT=60000
EXPECT_TIMEOUT=10000
ACTION_TIMEOUT=15000
NAVIGATION_TIMEOUT=30000
```

---

STEP 7 — Final `playwright.config.js` (Wired to Config + Reporters)

`playwright.config.js` — COMPLETE

```javascript
// @ts-check
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
import env from "./config/env.config.js";

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.js",
  timeout: env.timeouts.test,
  expect: { timeout: env.timeouts.expect },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,

  reporter: [
    ["list"],
    ["html", { outputFolder: "reports/html-report", open: "never" }],
    ["json", { outputFile: "reports/json-report/results.json" }],
    ["junit", { outputFile: "reports/junit-report/results.xml" }],
    [
      "allure-playwright",
      { resultsDir: "reports/allure-results", detail: true, suiteTitle: true },
    ],
  ],

  use: {
    baseURL: env.baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,
    headless: env.headless,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
  },

  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],

  outputDir: "test-results",
});
```

> This is the FINAL config. `globalSetup`, reporters, and `projects` reference files we create in Steps 9–12; that's fine — Playwright only reads them at run time.

---

STEP 8 — Utilities

`utils/stringUtils.js` — COMPLETE

```javascript
/**
 * stringUtils - reusable string/number helpers.
 */
export function parsePrice(priceString) {
  return parseFloat(String(priceString).replace(/[^\d.-]/g, ""));
}

export function toCurrency(amount, symbol = "$") {
  return `${symbol}${Number(amount).toFixed(2)}`;
}

export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-");
}

export function normalizeSpaces(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

export function containsIgnoreCase(haystack, needle) {
  return String(haystack).toLowerCase().includes(String(needle).toLowerCase());
}

export default {
  parsePrice,
  toCurrency,
  capitalize,
  slugify,
  normalizeSpaces,
  containsIgnoreCase,
};
```

`utils/waitUtils.js` — COMPLETE

```javascript
import logger from "./logger.js";

/**
 * Retry an async function until it succeeds or attempts are exhausted.
 */
export async function retry(
  fn,
  { retries = 3, delay = 1000, name = "action" } = {},
) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      logger.warn(
        `Retry ${attempt}/${retries} failed for "${name}": ${error.message}`,
      );
      if (attempt < retries) {
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Poll a condition until it returns true or times out.
 */
export async function waitUntil(
  condition,
  { timeout = 10000, interval = 500, message = "condition" } = {},
) {
  const endTime = Date.now() + timeout;
  while (Date.now() < endTime) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }
  throw new Error(`Timed out after ${timeout}ms waiting for: ${message}`);
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { retry, waitUntil, sleep };
```

`utils/dataGenerator.js` — COMPLETE

```javascript
/**
 * dataGenerator - lightweight, dependency-free random test-data generator.
 */
const FIRST_NAMES = [
  "John",
  "Jane",
  "Alex",
  "Priya",
  "Liam",
  "Sara",
  "Raj",
  "Emma",
  "Noah",
  "Mia",
];
const LAST_NAMES = [
  "Doe",
  "Smith",
  "Sharma",
  "Brown",
  "Khan",
  "Patel",
  "Jones",
  "Lee",
  "Verma",
];
const DOMAINS = ["example.com", "testmail.com", "mailinator.com", "qa-demo.io"];

export function randomInt(min = 0, max = 100) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function randomFrom(array) {
  return array[randomInt(0, array.length - 1)];
}

export function randomString(length = 8) {
  const chars =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars[randomInt(0, chars.length - 1)];
  }
  return result;
}

export function firstName() {
  return randomFrom(FIRST_NAMES);
}

export function lastName() {
  return randomFrom(LAST_NAMES);
}

export function fullName() {
  return `${firstName()} ${lastName()}`;
}

export function email(prefix = "user") {
  return `${prefix}_${Date.now()}_${randomString(4).toLowerCase()}@${randomFrom(DOMAINS)}`;
}

export function postalCode(length = 5) {
  let code = "";
  for (let i = 0; i < length; i++) {
    code += randomInt(0, 9);
  }
  return code;
}

export function phoneNumber() {
  return `9${postalCode(9)}`;
}

export function customer() {
  return {
    firstName: firstName(),
    lastName: lastName(),
    email: email(),
    postalCode: postalCode(),
    phone: phoneNumber(),
  };
}

export default {
  randomInt,
  randomFrom,
  randomString,
  firstName,
  lastName,
  fullName,
  email,
  postalCode,
  phoneNumber,
  customer,
};
```

`utils/dataReader.js` — COMPLETE

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, "..", "test-data");

/** Read and parse a JSON test-data file. */
function readJSON(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

/** Read a CSV file into an array of objects (first row = headers). */
function readCSV(fileName) {
  const filePath = path.join(DATA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Test data file not found: ${filePath}`);
  }
  const content = fs.readFileSync(filePath, "utf-8").trim();
  const [headerLine, ...lines] = content.split(/\r?\n/);
  const headers = headerLine.split(",").map((h) => h.trim());
  return lines.map((line) => {
    const values = line.split(",").map((v) => v.trim());
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {});
  });
}

export { readJSON, readCSV };
```

`utils/assertionUtils.js` — COMPLETE

```javascript
import { expect } from "@playwright/test";
import logger from "./logger.js";

/**
 * assertionUtils - business-readable, logged assertion helpers.
 * Every check is logged so the report/logs read like a test narrative.
 */
export function assertEquals(actual, expected, message = "") {
  logger.info(`Assert equals: "${actual}" === "${expected}" ${message}`);
  expect(actual, message).toBe(expected);
}

export function assertTrue(condition, message = "") {
  logger.info(`Assert true ${message}`);
  expect(condition, message).toBeTruthy();
}

export function assertFalse(condition, message = "") {
  logger.info(`Assert false ${message}`);
  expect(condition, message).toBeFalsy();
}

export function assertContains(text, substring, message = "") {
  logger.info(`Assert "${text}" contains "${substring}" ${message}`);
  expect(String(text), message).toContain(substring);
}

export async function assertVisible(locator, message = "") {
  logger.info(`Assert visible ${message}`);
  await expect(locator, message).toBeVisible();
}

export async function assertHasText(locator, text, message = "") {
  logger.info(`Assert has text "${text}" ${message}`);
  await expect(locator, message).toHaveText(text);
}

export default {
  assertEquals,
  assertTrue,
  assertFalse,
  assertContains,
  assertVisible,
  assertHasText,
};
```

`utils/dateUtils.js` — COMPLETE

```javascript
/**
 * dateUtils - reusable date/time helpers commonly needed in tests
 * (timestamps for unique data, formatted dates for forms & assertions).
 */

/** Current timestamp in ms (great for unique IDs/screenshot names). */
export function timestamp() {
  return Date.now();
}

/**
 * Today's date formatted as YYYY-MM-DD (or a custom separator).
 * @param {string} [separator='-']
 */
export function today(separator = "-") {
  const d = new Date();
  return format(d, separator);
}

/**
 * Return a date offset from today by a number of days.
 * @param {number} days positive = future, negative = past
 * @param {string} [separator='-']
 */
export function addDays(days, separator = "-") {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return format(d, separator);
}

/**
 * Format a Date object as YYYY[sep]MM[sep]DD.
 * @param {Date} date
 * @param {string} [separator='-']
 */
export function format(date, separator = "-") {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}${separator}${mm}${separator}${dd}`;
}

/** Human-readable timestamp: YYYY-MM-DD_HH-mm-ss (safe for filenames). */
export function fileTimestamp() {
  const d = new Date();
  const date = format(d, "-");
  const time = `${String(d.getHours()).padStart(2, "0")}-${String(
    d.getMinutes(),
  ).padStart(2, "0")}-${String(d.getSeconds()).padStart(2, "0")}`;
  return `${date}_${time}`;
}

export default { timestamp, today, addDays, format, fileTimestamp };
```

`utils/fileUtils.js` — COMPLETE

```javascript
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./logger.js";

/**
 * fileUtils - reusable filesystem helpers for downloads, reports,
 * temp files and cleanup. Common in real frameworks for verifying
 * downloaded files and managing artifacts.
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.join(__dirname, "..");

/** Resolve a path relative to the framework root. */
export function fromRoot(...segments) {
  return path.join(ROOT_DIR, ...segments);
}

/** Whether a file or directory exists. */
export function exists(filePath) {
  return fs.existsSync(filePath);
}

/** Create a directory (recursively) if it doesn't exist. */
export function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    logger.info(`Created directory: ${dirPath}`);
  }
}

/** Read a file as UTF-8 text. */
export function readText(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

/** Write text to a file (creates parent dirs). */
export function writeText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf-8");
  logger.info(`Wrote file: ${filePath}`);
}

/** Append text to a file. */
export function appendText(filePath, content) {
  ensureDir(path.dirname(filePath));
  fs.appendFileSync(filePath, content, "utf-8");
}

/** Delete a file if it exists. */
export function deleteFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    logger.info(`Deleted file: ${filePath}`);
  }
}

/** Get a file's size in bytes (0 if missing). */
export function fileSize(filePath) {
  return fs.existsSync(filePath) ? fs.statSync(filePath).size : 0;
}

/**
 * Save a Playwright Download to a target path and return it.
 * @param {import('@playwright/test').Download} download
 * @param {string} targetPath
 */
export async function saveDownload(download, targetPath) {
  ensureDir(path.dirname(targetPath));
  await download.saveAs(targetPath);
  logger.info(`Saved download to: ${targetPath}`);
  return targetPath;
}

export default {
  fromRoot,
  exists,
  ensureDir,
  readText,
  writeText,
  appendText,
  deleteFile,
  fileSize,
  saveDownload,
};
```

---

STEP 9 — Fixtures (Dependency Injection)

`fixtures/baseFixture.js` — COMPLETE

```javascript
import { test as base, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage.js";
import InventoryPage from "../pages/InventoryPage.js";
import CartPage from "../pages/CartPage.js";
import CheckoutPage from "../pages/CheckoutPage.js";
import CheckoutCompletePage from "../pages/CheckoutCompletePage.js";
import * as dataGenerator from "../utils/dataGenerator.js";
import env from "../config/env.config.js";
import logger from "../utils/logger.js";

/**
 * Custom Playwright fixtures (dependency injection layer).
 */
const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  inventoryPage: async ({ page }, use) => {
    await use(new InventoryPage(page));
  },
  cartPage: async ({ page }, use) => {
    await use(new CartPage(page));
  },
  checkoutPage: async ({ page }, use) => {
    await use(new CheckoutPage(page));
  },
  checkoutCompletePage: async ({ page }, use) => {
    await use(new CheckoutCompletePage(page));
  },

  // Auto-login fixture: authenticated session ready to use.
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.users.standard, env.password);
    await page.waitForURL(/inventory/);
    await use(page);
  },

  // Data generator fixture.
  data: async ({}, use) => {
    await use(dataGenerator);
  },
});

/**
 * Global afterEach: on failure, attach a full-page screenshot to the report.
 */
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    logger.warn(`Test failed: "${testInfo.title}" — attaching screenshot`);
    try {
      const screenshot = await page.screenshot({ fullPage: true });
      await testInfo.attach("failure-screenshot", {
        body: screenshot,
        contentType: "image/png",
      });
    } catch (error) {
      logger.error(`Could not capture failure screenshot: ${error.message}`);
    }
  }
});

export { test, expect };
```

> 🔑 From now on, every spec imports `test`/`expect` from this file — never from `@playwright/test`.

---

STEP 10 — Test Data (Data-Driven Layer)

`test-data/users.json`

```json
{
  "standard": {
    "username": "standard_user",
    "password": "secret_sauce",
    "description": "Works normally"
  },
  "lockedOut": {
    "username": "locked_out_user",
    "password": "secret_sauce",
    "description": "Cannot log in - locked out",
    "expectedError": "Epic sadface: Sorry, this user has been locked out."
  },
  "problem": {
    "username": "problem_user",
    "password": "secret_sauce",
    "description": "UI issues but can log in"
  },
  "performance": {
    "username": "performance_glitch_user",
    "password": "secret_sauce",
    "description": "Logs in with a delay"
  }
}
```

`test-data/loginData.json`

```json
{
  "validLogin": { "username": "standard_user", "password": "secret_sauce" },
  "invalidCredentials": [
    {
      "testId": "TC_LOGIN_01",
      "username": "invalid_user",
      "password": "secret_sauce",
      "description": "Invalid username",
      "expectedError": "Epic sadface: Username and password do not match any user in this service"
    },
    {
      "testId": "TC_LOGIN_02",
      "username": "standard_user",
      "password": "wrong_password",
      "description": "Invalid password",
      "expectedError": "Epic sadface: Username and password do not match any user in this service"
    }
  ],
  "emptyCredentials": [
    {
      "testId": "TC_LOGIN_04",
      "username": "",
      "password": "secret_sauce",
      "description": "Empty username",
      "expectedError": "Epic sadface: Username is required"
    },
    {
      "testId": "TC_LOGIN_05",
      "username": "standard_user",
      "password": "",
      "description": "Empty password",
      "expectedError": "Epic sadface: Password is required"
    }
  ]
}
```

`test-data/checkoutData.json`

```json
{
  "validCustomers": [
    {
      "testId": "TC_CHECKOUT_01",
      "firstName": "John",
      "lastName": "Doe",
      "postalCode": "12345",
      "description": "Standard valid customer"
    }
  ],
  "invalidCustomers": [
    {
      "testId": "TC_CHECKOUT_10",
      "firstName": "",
      "lastName": "Doe",
      "postalCode": "12345",
      "description": "Missing first name",
      "expectedError": "Error: First Name is required"
    },
    {
      "testId": "TC_CHECKOUT_11",
      "firstName": "John",
      "lastName": "",
      "postalCode": "12345",
      "description": "Missing last name",
      "expectedError": "Error: Last Name is required"
    },
    {
      "testId": "TC_CHECKOUT_12",
      "firstName": "John",
      "lastName": "Doe",
      "postalCode": "",
      "description": "Missing postal code",
      "expectedError": "Error: Postal Code is required"
    }
  ]
}
```

---

STEP 11 — Specs (Plain + Data-Driven)

`tests/login/positiveLogin.spec.js` — COMPLETE (final, using fixtures)

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import env from "../../config/env.config.js";

const users = readJSON("users.json");

test.describe("Login - Positive @regression", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test("TC_LOGIN_VALID: valid standard user can log in @smoke", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(env.users.standard, env.password);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
    await expect(inventoryPage.pageTitle).toHaveText("Products");
  });

  test("TC_LOGIN_PROBLEM: problem user can log in", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(users.problem.username, env.password);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
  });

  test("TC_LOGIN_PERF: performance glitch user can log in", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(users.performance.username, env.password);
    await expect(inventoryPage.pageTitle).toHaveText("Products");
  });
});
```

`tests/login/negativeLogin.spec.js` — COMPLETE (data-driven loop)

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import { MESSAGES } from "../../utils/constants.js";
import env from "../../config/env.config.js";

const loginData = readJSON("loginData.json");
const users = readJSON("users.json");

test.describe("Login - Negative @regression", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test("TC_LOGIN_LOCKED: locked-out user sees lockout error @smoke", async ({
    loginPage,
  }) => {
    await loginPage.login(users.lockedOut.username, env.password);
    expect(await loginPage.getErrorMessage()).toBe(MESSAGES.LOCKED_OUT);
  });

  // Data-Driven: invalid credentials
  for (const data of loginData.invalidCredentials) {
    test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
      await loginPage.login(data.username, data.password);
      expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
    });
  }

  // Data-Driven: empty credentials
  for (const data of loginData.emptyCredentials) {
    test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
      await loginPage.login(data.username, data.password);
      expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
    });
  }
});
```

`tests/checkout/checkout.spec.js` — COMPLETE (data-driven + soft asserts + steps)

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import { TITLES, MESSAGES } from "../../utils/constants.js";
import dataGenerator from "../../utils/dataGenerator.js";

const checkoutData = readJSON("checkoutData.json");

test.describe("Checkout Module @regression", () => {
  // Log in and add a product before every checkout test
  test.beforeEach(async ({ loggedInPage, inventoryPage, cartPage }) => {
    void loggedInPage; // triggers auto-login
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

  test("TC_CHECKOUT_RANDOM: complete order with randomly generated customer data", async ({
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
```

`tests/login/logout.spec.js` — COMPLETE

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
import { ROUTES } from "../../utils/constants.js";
import env from "../../config/env.config.js";

/**
 * Logout Scenario
 * ------------------------------------------------------------------
 * Verifies a logged-in user can log out and is returned to the login page.
 */
test.describe("Login - Logout @regression", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test("TC_LOGIN_LOGOUT: user can log out successfully", async ({
    loginPage,
    inventoryPage,
  }) => {
    await loginPage.login(env.users.standard, env.password);
    expect(await inventoryPage.isLoaded()).toBeTruthy();
    await inventoryPage.logout();
    await expect(loginPage.loginButton).toBeVisible();
    expect(inventoryPage.getUrl()).toContain(ROUTES.LOGIN);
  });
});
```

`tests/inventory/inventory.spec.js` — COMPLETE (data-driven + sorting)

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import { SORT_OPTIONS, EXPECTED_PRODUCT_COUNT } from "../../utils/constants.js";

const productsData = readJSON("products.json");

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
    expect(names.sort()).toEqual(expectedNames.sort());
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
});
```

`tests/cart/cart.spec.js` — COMPLETE

```javascript
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
    expect(await cartPage.getItemCount()).toBe(1);
    await cartPage.removeItem("Sauce Labs Backpack");
    expect(await cartPage.getItemCount()).toBe(0);
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
});
```

`tests/e2e/purchaseJourney.spec.js` — COMPLETE (full end-to-end flow)

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
import { TITLES, SORT_OPTIONS } from "../../utils/constants.js";
import env from "../../config/env.config.js";

/**
 * End-to-End Purchase Journey
 * ------------------------------------------------------------------
 * A single test that walks the COMPLETE user flow the way a real
 * customer would, touching every module:
 *   Login -> Browse/Sort -> Add to Cart -> Verify Cart
 *        -> Checkout Info -> Overview (totals) -> Finish -> Confirmation
 *
 * This is a true E2E: it starts from the login page (no auto-login
 * fixture) so the whole journey is validated as one continuous scenario.
 */
test.describe("E2E - Purchase Journey @e2e", () => {
  test("TC_E2E_01: user can log in, buy two products and complete checkout @smoke", async ({
    loginPage,
    inventoryPage,
    cartPage,
    checkoutPage,
    checkoutCompletePage,
  }) => {
    const products = ["Sauce Labs Backpack", "Sauce Labs Bike Light"];

    await test.step("1. Log in as the standard user", async () => {
      await loginPage.open();
      await loginPage.login(env.users.standard, env.password);
      expect(await inventoryPage.isLoaded()).toBeTruthy();
      await expect(inventoryPage.pageTitle).toHaveText(TITLES.PRODUCTS);
    });

    await test.step("2. Sort products low to high and add two items", async () => {
      await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
      await inventoryPage.addMultipleProducts(products);
      expect(await inventoryPage.getCartCount()).toBe(products.length);
    });

    await test.step("3. Open the cart and verify the selected items", async () => {
      await inventoryPage.goToCart();
      await expect(cartPage.pageTitle).toHaveText(TITLES.YOUR_CART);
      expect(await cartPage.getItemCount()).toBe(products.length);
      const names = await cartPage.getCartItemNames();
      for (const product of products) {
        expect(names).toContain(product);
      }
    });

    await test.step("4. Proceed to checkout and fill customer information", async () => {
      await cartPage.proceedToCheckout();
      await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_INFO);
      await checkoutPage.fillCustomerInfo("John", "Doe", "12345");
      await checkoutPage.continue();
    });

    await test.step("5. Verify order summary math (subtotal + tax = total)", async () => {
      await expect(checkoutPage.pageTitle).toHaveText(TITLES.CHECKOUT_OVERVIEW);
      const subtotal = await checkoutPage.getSubtotal();
      const tax = await checkoutPage.getTax();
      const total = await checkoutPage.getTotal();
      expect(Number((subtotal + tax).toFixed(2))).toBe(total);
    });

    await test.step("6. Finish the order and verify confirmation", async () => {
      await checkoutPage.finish();
      await expect(checkoutCompletePage.pageTitle).toHaveText(
        TITLES.CHECKOUT_COMPLETE,
      );
      expect(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
    });

    await test.step("7. Return home and confirm the cart is empty", async () => {
      await checkoutCompletePage.backHome();
      expect(await inventoryPage.isLoaded()).toBeTruthy();
      expect(await inventoryPage.getCartCount()).toBe(0);
    });
  });
});
```

---

STEP 12 — Reporting + Global Setup

Install Allure: `npm install -D allure-playwright allure-commandline`
(Reporters are already configured in the Step 7 `playwright.config.js`.)

`global-setup.js` — COMPLETE

```javascript
import fs from "fs";
import path from "path";
import os from "os";
import env from "./config/env.config.js";

/**
 * Global setup — runs once before the whole test run.
 * Writes Allure environment.properties so the report shows run context.
 */
export default async function globalSetup() {
  const allureResultsDir = path.resolve("reports/allure-results");
  fs.mkdirSync(allureResultsDir, { recursive: true });

  const properties = {
    Environment: env.name,
    "Base.URL": env.baseURL,
    Browser: process.env.BROWSER || "chromium",
    "Node.Version": process.version,
    OS: `${os.type()} ${os.release()}`,
    Platform: os.platform(),
    CI: process.env.CI ? "true" : "false",
    "Executed.At": new Date().toISOString(),
  };

  const content = Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(
    path.join(allureResultsDir, "environment.properties"),
    content,
    "utf-8",
  );
}
```

View reports:

```powershell
npx playwright show-report reports/html-report
npx playwright show-trace          # pick a trace zip from test-results
allure serve reports/allure-results
```

---

STEP 14 — Unit Tests

`tests/unit/stringUtils.unit.spec.js` — COMPLETE

```javascript
import { test, expect } from "@playwright/test";
import {
  parsePrice,
  toCurrency,
  capitalize,
  slugify,
  normalizeSpaces,
  containsIgnoreCase,
} from "../../utils/stringUtils.js";

/**
 * Unit tests for the stringUtils helper module.
 * These run without a browser — they simply validate pure functions.
 */
test.describe("Unit: stringUtils @unit", () => {
  test("parsePrice extracts a number from a currency string", () => {
    expect(parsePrice("$29.99")).toBe(29.99);
    expect(parsePrice("7.99 USD")).toBe(7.99);
    expect(parsePrice("$0.00")).toBe(0);
  });

  test("toCurrency formats a number with two decimals", () => {
    expect(toCurrency(29.9)).toBe("$29.90");
    expect(toCurrency(5, "€")).toBe("€5.00");
  });

  test("capitalize upper-cases the first letter only", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("")).toBe("");
  });

  test("slugify converts a product name to a data-test friendly id", () => {
    expect(slugify("Sauce Labs Backpack")).toBe("sauce-labs-backpack");
    expect(slugify("Sauce Labs Bolt T-Shirt")).toBe("sauce-labs-bolt-t-shirt");
    expect(slugify("Test.allTheThings() T-Shirt (Red)")).toBe(
      "test.allthethings-t-shirt-red",
    );
  });

  test("normalizeSpaces collapses whitespace", () => {
    expect(normalizeSpaces("  a   b \n c ")).toBe("a b c");
  });

  test("containsIgnoreCase is case-insensitive", () => {
    expect(containsIgnoreCase("Hello World", "WORLD")).toBe(true);
    expect(containsIgnoreCase("Hello World", "xyz")).toBe(false);
  });
});
```

`tests/unit/waitUtils.unit.spec.js` — COMPLETE

```javascript
import { test, expect } from "@playwright/test";
import { retry, waitUntil, sleep } from "../../utils/waitUtils.js";

/**
 * Unit tests for the waitUtils helper module.
 */
test.describe("Unit: waitUtils @unit", () => {
  test("sleep waits for approximately the given time", async () => {
    const start = Date.now();
    await sleep(100);
    expect(Date.now() - start).toBeGreaterThanOrEqual(90);
  });

  test("retry succeeds after transient failures", async () => {
    let attempts = 0;
    const result = await retry(
      async () => {
        attempts += 1;
        if (attempts < 3) throw new Error("transient");
        return "ok";
      },
      { retries: 5, delay: 10, name: "flaky-op" },
    );
    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  test("retry throws after exhausting attempts", async () => {
    await expect(
      retry(
        async () => {
          throw new Error("always fails");
        },
        { retries: 2, delay: 10 },
      ),
    ).rejects.toThrow("always fails");
  });

  test("waitUntil resolves when the condition becomes true", async () => {
    let ready = false;
    setTimeout(() => {
      ready = true;
    }, 50);
    await waitUntil(() => ready, { timeout: 1000, interval: 10 });
    expect(ready).toBe(true);
  });

  test("waitUntil times out when condition never true", async () => {
    await expect(
      waitUntil(() => false, {
        timeout: 100,
        interval: 20,
        message: "never true",
      }),
    ).rejects.toThrow(/never true/);
  });
});
```

`tests/unit/dataGenerator.unit.spec.js` — COMPLETE

```javascript
import { test, expect } from "@playwright/test";
import {
  randomInt,
  randomFrom,
  randomString,
  firstName,
  lastName,
  fullName,
  email,
  postalCode,
  phoneNumber,
  customer,
} from "../../utils/dataGenerator.js";

/**
 * Unit tests for the dataGenerator helper module.
 */
test.describe("Unit: dataGenerator @unit", () => {
  test("randomInt returns a value within range (inclusive)", () => {
    for (let i = 0; i < 50; i++) {
      const n = randomInt(1, 5);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  test("randomFrom returns an element from the array", () => {
    const arr = ["a", "b", "c"];
    expect(arr).toContain(randomFrom(arr));
  });

  test("randomString returns a string of the requested length", () => {
    expect(randomString(10)).toHaveLength(10);
    expect(randomString()).toHaveLength(8);
  });

  test("firstName / lastName / fullName return non-empty strings", () => {
    expect(firstName().length).toBeGreaterThan(0);
    expect(lastName().length).toBeGreaterThan(0);
    expect(fullName().split(" ")).toHaveLength(2);
  });

  test("email is unique and well formed", () => {
    const a = email();
    const b = email();
    expect(a).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(a).not.toBe(b);
  });

  test("postalCode returns numeric string of given length", () => {
    const code = postalCode(5);
    expect(code).toHaveLength(5);
    expect(code).toMatch(/^\d+$/);
  });

  test("phoneNumber returns a 10-digit number starting with 9", () => {
    const phone = phoneNumber();
    expect(phone).toMatch(/^9\d{9}$/);
  });

  test("customer returns a complete object", () => {
    const c = customer();
    expect(c).toHaveProperty("firstName");
    expect(c).toHaveProperty("lastName");
    expect(c).toHaveProperty("email");
    expect(c).toHaveProperty("postalCode");
    expect(c).toHaveProperty("phone");
  });
});
```

`tests/unit/dateUtils.unit.spec.js` — COMPLETE

```javascript
import { test, expect } from "@playwright/test";
import {
  timestamp,
  today,
  addDays,
  format,
  fileTimestamp,
} from "../../utils/dateUtils.js";

/**
 * Unit tests for the dateUtils helper module.
 */
test.describe("Unit: dateUtils @unit", () => {
  test("timestamp returns a positive number", () => {
    expect(timestamp()).toBeGreaterThan(0);
  });

  test("today returns YYYY-MM-DD format", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today("/")).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  test("format formats a fixed date correctly", () => {
    const d = new Date(2024, 0, 5); // 5 Jan 2024
    expect(format(d)).toBe("2024-01-05");
  });

  test("addDays returns a valid future/past date string", () => {
    expect(addDays(1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(addDays(-1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("fileTimestamp is filename-safe", () => {
    expect(fileTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
  });
});
```

---

STEP 15 — CI/CD + Final `package.json`

`package.json` — COMPLETE (all scripts + deps)

```json
{
  "name": "saucedemo-ui-framework",
  "version": "1.0.0",
  "description": "Industry-level Data-Driven UI Test Automation Framework using JavaScript + Playwright + POM for SauceDemo",
  "main": "index.js",
  "type": "module",
  "scripts": {
    "test": "npx playwright test",
    "test:headed": "npx playwright test --headed",
    "test:chromium": "npx playwright test --project=chromium",
    "test:firefox": "npx playwright test --project=firefox",
    "test:webkit": "npx playwright test --project=webkit",
    "test:smoke": "npx playwright test --grep @smoke",
    "test:regression": "npx playwright test --grep @regression",
    "test:login": "npx playwright test tests/login",
    "test:inventory": "npx playwright test tests/inventory",
    "test:cart": "npx playwright test tests/cart",
    "test:checkout": "npx playwright test tests/checkout",
    "test:unit": "npx playwright test tests/unit",
    "test:dev": "cross-env ENV=dev npx playwright test",
    "test:qa": "cross-env ENV=qa npx playwright test",
    "test:staging": "cross-env ENV=staging npx playwright test",
    "test:trace": "npx playwright test --trace on",
    "test:debug": "npx playwright test --debug",
    "test:ui": "npx playwright test --ui",
    "show-trace": "npx playwright show-trace",
    "report": "npx playwright show-report reports/html-report",
    "allure:generate": "allure generate reports/allure-results --clean -o reports/allure-report",
    "allure:open": "allure open reports/allure-report",
    "allure:serve": "allure serve reports/allure-results",
    "clean": "rimraf reports test-results"
  },
  "keywords": [
    "playwright",
    "javascript",
    "pom",
    "data-driven",
    "automation",
    "saucedemo"
  ],
  "author": "QA Automation Team",
  "license": "MIT",
  "devDependencies": {
    "@playwright/test": "^1.48.0",
    "allure-commandline": "^2.30.0",
    "allure-playwright": "^3.0.0",
    "cross-env": "^7.0.3",
    "dotenv": "^16.4.5",
    "rimraf": "^6.0.1",
    "winston": "^3.14.2"
  }
}
```

`.github/workflows/playwright.yml` — COMPLETE

```yaml
name: Playwright Tests

on:
  push:
    branches: [main, master, develop]
  pull_request:
    branches: [main, master, develop]
  workflow_dispatch:
    inputs:
      suite:
        description: "Test suite to run"
        required: false
        default: "all"
        type: choice
        options: [all, smoke, regression]

jobs:
  test:
    name: Run Playwright Tests (${{ matrix.browser }})
    runs-on: ubuntu-latest
    timeout-minutes: 30
    strategy:
      fail-fast: false
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: "npm"
      - name: Install dependencies
        run: npm ci
      - name: Install Playwright browsers
        run: npx playwright install --with-deps ${{ matrix.browser }}
      - name: Run Playwright tests
        env:
          CI: true
          HEADLESS: true
        run: |
          SUITE="${{ github.event.inputs.suite || 'all' }}"
          GREP=""
          if [ "$SUITE" = "smoke" ]; then GREP="--grep @smoke"; fi
          if [ "$SUITE" = "regression" ]; then GREP="--grep @regression"; fi
          npx playwright test --project=${{ matrix.browser }} $GREP
      - name: Upload Playwright HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: html-report-${{ matrix.browser }}
          path: reports/html-report
          retention-days: 7
      - name: Upload Allure results
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: allure-results-${{ matrix.browser }}
          path: reports/allure-results
          retention-days: 7
```

`Jenkinsfile` — COMPLETE

```groovy
pipeline {
    agent any

    tools {
        nodejs 'Node20'
    }

    parameters {
        choice(name: 'BROWSER', choices: ['chromium', 'firefox', 'webkit', 'all'], description: 'Browser project to run')
        choice(name: 'SUITE', choices: ['all', 'smoke', 'regression'], description: 'Test suite to execute')
    }

    options {
        timestamps()
        ansiColor('xterm')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
    }

    environment {
        CI = 'true'
        HEADLESS = 'true'
    }

    stages {
        stage('Checkout') {
            steps { checkout scm }
        }
        stage('Install Dependencies') {
            steps { sh 'npm ci' }
        }
        stage('Install Playwright Browsers') {
            steps { sh 'npx playwright install --with-deps' }
        }
        stage('Run Tests') {
            steps {
                script {
                    def projectFlag = params.BROWSER == 'all' ? '' : "--project=${params.BROWSER}"
                    def grepFlag = ''
                    if (params.SUITE == 'smoke') {
                        grepFlag = '--grep @smoke'
                    } else if (params.SUITE == 'regression') {
                        grepFlag = '--grep @regression'
                    }
                    sh "npx playwright test ${projectFlag} ${grepFlag}"
                }
            }
        }
        stage('Generate Allure Report') {
            steps { sh 'npm run allure:generate' }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'reports/**', allowEmptyArchive: true
            junit testResults: 'reports/junit-report/*.xml', allowEmptyResults: true
        }
    }
}
```

`.gitignore` (essentials)

```
node_modules/
reports/
test-results/
logs/
.env
allure-results/
allure-report/
playwright-report/
```

---

STEP 16 — Final Execution (First Test → Full Suite → Reports)

Run in this order to demonstrate the whole flow live:

```powershell
# 1. Single spec (fast feedback)
npx playwright test tests/login/positiveLogin.spec.js

# 2. One suite by tag
npm run test:smoke

# 3. One module
npm run test:login

# 4. One browser
npm run test:chromium

# 5. Different environment
npm run test:staging

# 6. FULL suite — all browsers, parallel
npm test

# 7. Debug a failure
npm run test:debug
npm run show-trace     # then pick the trace zip from test-results

# 8. Reports
npm run report         # Playwright HTML
npm run allure:serve   # Allure
```

What happens on `npm test` (map each stage to its file)

```
npm test
  → playwright.config.js           (testDir, retries, workers, reporters, projects, use{})
  → config/env.config.js           (reads ENV, resolves baseURL/users/timeouts)
  → global-setup.js                (writes Allure environment.properties)
  → discovers tests/**/*.spec.js
  → spreads across workers, per project (chromium/firefox/webkit)
  → per test:
        fixtures/baseFixture.js    (injects page objects, loggedInPage, data)
        utils/dataReader.js        (reads test-data/*.json for data-driven specs)
        pages/*.js → BasePage.js   (actions) → utils/logger.js (Winston logs)
        expect(...) auto-retries until expect.timeout
        afterEach → on failure attaches screenshot/video/trace
  → retries failed tests (CI only)
  → reporters emit: list, HTML, JSON, JUnit, Allure
  → view: show-report | allure:serve | show-trace
```

---

✅ You're Done

You have built, from an empty folder:

- A POM + BasePage structure (OOP)
- Config-driven multi-environment support
- Fixtures for dependency injection & auto-login
- A full utilities layer
- Data-driven login & checkout suites
- Logging + Allure/HTML/JUnit/JSON reporting with screenshots/video/trace
- Cross-browser + parallel execution
- Unit test coverage
- GitHub Actions + Jenkins CI/CD

That is the journey from a single messy test to a production-ready automation framework — build each file only when its pain appears, and explain the _why_ at every step.

```

```
