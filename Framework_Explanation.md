SauceDemo Data-Driven Framework - Complete Documentation

Table of Contents

1. [Introduction to Framework](#1-introduction-to-framework)
2. [Complete Folder Structure Explanation](#2-complete-folder-structure-explanation)
3. [Framework Architecture](#3-framework-architecture)
4. [Test Execution Flow](#4-test-execution-flow)
5. [How to Explain This Framework in Interview](#5-how-to-explain-this-framework-in-interview)

---

1. Introduction to Framework

What is an Automation Framework?

An Automation Framework is a structured set of guidelines, coding standards, concepts, processes, and tools that provides a foundation for automated software testing. It is NOT a single tool — it is a complete architecture that organizes test code, test data, configurations, reporting, and utilities in a reusable, maintainable, and scalable way.

Simple Definition:

> A framework is an organized folder structure with reusable code that helps you write, run, and maintain automated tests efficiently.

Real-Time Example:
Think of a framework like a building blueprint. Just as a blueprint tells builders where to place walls, windows, and wiring — a framework tells test engineers where to place test files, page objects, utilities, and configurations.

This framework automates the [SauceDemo](https://www.saucedemo.com) e-commerce application (login, product inventory, cart, and checkout).

---

Why Frameworks Are Used in Playwright Automation

Without a framework, test code becomes:

- Hard to maintain — Changing one selector means updating 50+ tests
- Not reusable — Same login code written in every test file
- Difficult to scale — Adding new tests creates chaos
- Hard to debug — No structured logging or reporting
- Not team-friendly — New team members can't understand the code

With a framework:

| Problem                   | Framework Solution                                   |
| ------------------------- | ---------------------------------------------------- |
| Duplicate code            | Page Object Model (POM) — write once, use everywhere |
| Hard-coded test data      | Data-Driven approach — external JSON files           |
| Environment switching     | Multi-environment JSON configs (dev/qa/staging)      |
| No test reports           | Allure + HTML + JSON + JUnit reporters               |
| Debugging issues          | Winston Logger — structured log files                |
| Browser compatibility     | Cross-browser projects in playwright.config.js       |
| Manual screenshot capture | Automatic screenshots/trace/video on failure         |
| No CI/CD support          | Jenkins + GitHub Actions integrated                  |
| No unit safety net        | Utility unit tests (tests/unit/)                     |

---

Advantages of Using Framework Architecture

1. Code Reusability — BasePage methods used across all pages
2. Easy Maintenance — Change a locator in ONE place, all tests updated
3. Scalability — Add new tests/pages without touching existing code
4. Readability — Clean folder structure, anyone can understand
5. Data Separation — Test data separate from test logic
6. Multi-Environment — dev / qa / staging JSON configs
7. Parallel Execution — Run tests simultaneously across browsers
8. Rich Reporting — Allure reports with environment info, screenshots, trace, video
9. CI/CD Ready — Jenkins + GitHub Actions pipelines
10. Team Collaboration — Consistent coding patterns and conventions
11. Modern JavaScript — ES Modules (`import`/`export`), no legacy `require`

---

Framework Type Used in This Project

This project uses a Data-Driven Framework combining multiple design patterns:

1. Page Object Model (POM)

- Each web page has its own Page Class (LoginPage, InventoryPage, CartPage, CheckoutPage, CheckoutCompletePage)
- Page classes contain locators and business methods (actions)
- Tests call page methods instead of directly interacting with elements
- All pages extend a common BasePage

2. Data-Driven Testing

- Test data stored in external JSON files
- Same test logic runs with different data sets via `for...of` loops
- Files: `loginData.json`, `users.json`, `checkoutData.json`, `products.json`

3. Modular/Utility-Based

- Common reusable utilities in `utils/` folder
- logger, dataReader, constants, waitUtils, dataGenerator, dateUtils, stringUtils, fileUtils, assertionUtils
- BasePage provides common methods inherited by all page objects

Framework Stack:

```
JavaScript (ES Modules) + Playwright + POM + Data-Driven + Allure
```

---

2. Complete Folder Structure Explanation

```
saucedemo-framework/
├── config/                         # Environment configuration
│   ├── env.config.js               # Central multi-environment resolver
│   └── environments/               # Per-environment settings (JSON)
│       ├── dev.json
│       ├── qa.json
│       └── staging.json
├── fixtures/                       # Custom Playwright test fixtures
│   └── baseFixture.js              # Page object DI + auto-login + data + afterEach
├── pages/                          # Page Object Model classes
│   ├── BasePage.js                 # Base class with reusable generic methods
│   ├── LoginPage.js                # Login page actions and locators
│   ├── InventoryPage.js            # Products page actions and locators
│   ├── CartPage.js                 # Cart page actions and locators
│   ├── CheckoutPage.js             # Checkout step one + step two
│   └── CheckoutCompletePage.js     # Order confirmation page
├── tests/                          # Test spec files organized by module
│   ├── login/
│   │   ├── positiveLogin.spec.js   # Valid login scenarios
│   │   ├── negativeLogin.spec.js   # Invalid/empty/locked (data-driven)
│   │   └── logout.spec.js          # Logout scenario
│   ├── inventory/inventory.spec.js # Product listing scenarios
│   ├── cart/cart.spec.js           # Cart scenarios
│   ├── checkout/checkout.spec.js   # Checkout scenarios (soft assertions + steps)
│   ├── unit/                       # Pure unit tests for utilities
│   │   ├── stringUtils.unit.spec.js
│   │   ├── dataGenerator.unit.spec.js
│   │   ├── dateUtils.unit.spec.js
│   │   └── waitUtils.unit.spec.js
├── test-data/                      # External test data files
│   ├── loginData.json              # Valid, invalid, empty credentials
│   ├── users.json                  # standard/lockedOut/problem/performance
│   ├── checkoutData.json           # Valid & invalid customers
│   └── products.json               # Product names + prices
├── utils/                          # Reusable utility layer
│   ├── logger.js                   # Winston structured logging
│   ├── dataReader.js               # JSON/CSV readers
│   ├── constants.js                # Routes, messages, titles, sort options
│   ├── waitUtils.js                # retry / waitUntil / sleep
│   ├── dataGenerator.js            # Random test data (Faker-style)
│   ├── dateUtils.js                # Timestamps & date formatting
│   ├── stringUtils.js              # parsePrice, slugify, capitalize...
│   ├── fileUtils.js                # File read/write/download helpers
│   └── assertionUtils.js           # Readable assertion wrappers
├── .github/workflows/
│   └── playwright.yml              # GitHub Actions CI (matrix browsers)
├── reports/                        # Generated reports (gitignored)
│   ├── html-report/                # Playwright HTML report
│   ├── json-report/results.json    # JSON results
│   ├── junit-report/results.xml    # JUnit results
│   └── allure-results/             # Allure raw results + environment.properties
├── logs/                           # Winston log files
│   ├── test-execution.log          # All log levels
│   └── error.log                   # Error-only logs
├── test-results/                   # Playwright artifacts (traces, videos)
├── global-setup.js                 # Writes Allure environment.properties
├── playwright.config.js            # Central Playwright configuration
├── Jenkinsfile                     # Jenkins declarative pipeline
├── .env / .env.example             # Environment variables
├── package.json                    # Dependencies and npm scripts
└── README.md                       # Project documentation
```

---

Detailed File-by-File Explanation

---

`playwright.config.js` — Central Configuration File

Purpose: The single most important file in the framework. Controls ALL test execution behavior.

Why it is used: Playwright reads this file FIRST before running any test. It tells Playwright which browsers to use, timeouts, reporters, where to find tests, and which global setup to run.

How it works:

```javascript
// @ts-check
import { defineConfig, devices } from "@playwright/test";
import "dotenv/config";
import env from "./config/env.config.js"; // resolved environment object

export default defineConfig({
  testDir: "./tests",
  globalSetup: "./global-setup.js", // writes Allure env info once
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

Key Configurations Explained:

| Config            | Value               | Purpose                                          |
| ----------------- | ------------------- | ------------------------------------------------ |
| `testDir`         | `./tests`           | Where test files live                            |
| `globalSetup`     | `./global-setup.js` | Runs once before all tests (Allure env info)     |
| `timeout`         | `env.timeouts.test` | Max time per test (from env config)              |
| `fullyParallel`   | `true`              | Tests run simultaneously                         |
| `retries`         | `2 on CI, 1 local`  | Retry failed tests; a later pass is marked flaky |
| `reporter`        | Array of 5          | list + HTML + JSON + JUnit + Allure              |
| `screenshot`      | `only-on-failure`   | Auto-capture screenshot on failure               |
| `trace` / `video` | `retain-on-failure` | Save trace & video for failed tests              |
| `projects`        | 3 browsers          | Chromium, Firefox, WebKit                        |

Interview Explanation:

> "playwright.config.js is the central config. It imports my resolved environment object from config/env.config.js, sets timeouts, enables parallel execution, configures five reporters including Allure, retains trace/video/screenshots only on failure, defines three cross-browser projects, and wires a globalSetup that writes Allure environment info."

---

`config/env.config.js` — Multi-Environment Resolver

Purpose: Centralized, single source of truth for all environment configuration.

Why it is used: Real projects test on multiple environments (dev, qa, staging), each with different URLs and settings. Instead of hard-coding, we externalize into JSON and resolve one object.

How it works:

```javascript
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_NAME = process.env.ENV || "qa"; // 1. which env?

function loadEnvFile() {
  // 2. load JSON
  const file = path.join(__dirname, "environments", `${ENV_NAME}.json`);
  return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, "utf-8")) : {};
}

const fileConfig = loadEnvFile();
// 3. Merge order:  ENV file  ->  .env variables  ->  defaults
const env = {
  name: fileConfig.name || ENV_NAME,
  baseURL:
    process.env.BASE_URL || fileConfig.baseURL || "https://www.saucedemo.com",
  password:
    process.env.PASSWORD || fileConfig.credentials?.password || "secret_sauce",
  users: { standard, lockedOut, problem, performance, error },
  timeouts: { test, expect, action, navigation },
  headless: process.env.HEADLESS !== "false",
  logLevel: process.env.LOG_LEVEL || "info",
};

export default env;
```

Selection order: `ENV file` → `.env variable` → `hard-coded default`.

Switch environments:

```bash
npm run test:staging          # cross-env ENV=staging
$env:ENV="staging"; npx playwright test   # PowerShell
```

Interview Explanation:

> "env.config.js resolves the active environment. It reads the ENV variable, loads config/environments/<ENV>.json, and merges values with .env overrides and safe defaults. Everything — baseURL, credentials, timeouts, headless — comes from this one object, which both playwright.config.js and the fixtures import."

---

`config/environments/*.json` — Per-Environment Settings

Purpose: Store environment-specific values as plain JSON.

Example (`qa.json`):

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
      "performance": "performance_glitch_user"
    }
  }
}
```

`dev.json`, `qa.json`, and `staging.json` share the same shape so switching environments never requires code changes.

---

`global-setup.js` — Allure Environment Info Generator

Purpose: Runs ONCE before the whole suite and writes `environment.properties` into the Allure results folder.

Why it is used: So the Allure report clearly shows _which_ environment, browser, OS, and Node version the run executed against.

How it works:

```javascript
import fs from "fs";
import path from "path";
import os from "os";
import env from "./config/env.config.js";

export default async function globalSetup() {
  const dir = path.resolve("reports/allure-results");
  fs.mkdirSync(dir, { recursive: true });
  const props = {
    Environment: env.name,
    "Base.URL": env.baseURL,
    Browser: process.env.BROWSER || "chromium",
    "Node.Version": process.version,
    OS: `${os.type()} ${os.release()}`,
    CI: process.env.CI ? "true" : "false",
    "Executed.At": new Date().toISOString(),
  };
  const content = Object.entries(props)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
  fs.writeFileSync(path.join(dir, "environment.properties"), content, "utf-8");
}
```

---

`fixtures/baseFixture.js` — Custom Fixtures (Dependency Injection)

Purpose: Creates and injects page object instances into every test automatically, plus provides auto-login, a data generator, and a global failure-screenshot hook. This is the heart of the framework's POM integration with Playwright.

Why it is used: Without fixtures, every test manually creates page objects. With fixtures, they are injected automatically.

```javascript
// Without fixtures (repetitive):
test("login", async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login("standard_user", "secret_sauce");
});

// With fixtures (clean):
test("login", async ({ loginPage }) => {
  await loginPage.login("standard_user", "secret_sauce");
});
```

How it works:

```javascript
import { test as base, expect } from "@playwright/test";
import LoginPage from "../pages/LoginPage.js";
// ...other page imports
import * as dataGenerator from "../utils/dataGenerator.js";
import env from "../config/env.config.js";
import logger from "../utils/logger.js";

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

  // Auto-login: land on inventory as standard user
  loggedInPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.open();
    await loginPage.login(env.users.standard, env.password);
    await page.waitForURL(/inventory/);
    await use(page);
  },

  // Fresh random data
  data: async ({}, use) => {
    await use(dataGenerator);
  },
});

// Global afterEach: attach screenshot on failure
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach("failure-screenshot", {
      body: shot,
      contentType: "image/png",
    });
  }
});

export { test, expect };
```

Available Fixtures:

| Fixture                | Provides                                       |
| ---------------------- | ---------------------------------------------- |
| `loginPage`            | Login page actions + locators                  |
| `inventoryPage`        | Product listing, sorting, add/remove, cart nav |
| `cartPage`             | Cart validation, remove, checkout nav          |
| `checkoutPage`         | Customer info form + overview                  |
| `checkoutCompletePage` | Order confirmation                             |
| `loggedInPage`         | Pre-authenticated page (standard user)         |
| `data`                 | Random data generator                          |

Interview Explanation:

> "baseFixture.js uses Playwright's custom fixtures for dependency injection. It injects all page objects, provides a loggedInPage auto-login fixture, and a data fixture for random data. It also adds a global afterEach that attaches a full-page screenshot to the report whenever a test fails."

---

`pages/` — Page Object Model Classes

Purpose: Each page has a class encapsulating locators and business methods.

Why it is used: POM separates test logic from page interaction logic, keeps tests readable, and centralizes locators so a change is made in ONE place.

---

`pages/BasePage.js` — Base Page Class

Purpose: The parent class ALL other page objects extend. Contains generic reusable methods that wrap Playwright interactions and log every action via Winston.

Why it is used: Instead of writing `page.locator(sel).click()` in every page class, we write it ONCE in BasePage and inherit it.

Key Methods (grouped):

| Category     | Methods                                                                   |
| ------------ | ------------------------------------------------------------------------- |
| Navigation   | `goto`, `reload`, `goBack`, `goForward`, `waitForUrl`, `waitForLoadState` |
| Clicks       | `click`, `forceClick`, `doubleClick`, `rightClick`, `jsClick`             |
| Input        | `fill`, `type`, `clear`, `pressKey`, `uploadFile`                         |
| Mouse        | `hover`, `dragAndDrop`, `scrollIntoView`, `scrollToBottom`                |
| Checkboxes   | `check`, `uncheck`, `isChecked`                                           |
| Dropdowns    | `selectByValue`, `selectByLabel`, `selectByIndex`                         |
| Read         | `getText`, `getAllTexts`, `getValue`, `getAttribute`, `count`             |
| State        | `isVisible`, `isEnabled`, `isDisabled`, `waitFor`                         |
| Dialogs/Tabs | `acceptDialog`, `dismissDialog`, `frame`, `openNewTab`                    |
| Misc         | `executeScript`, `getPageTitle`, `getUrl`, `takeScreenshot`               |
| Private      | `_resolve`, `_describe`                                                   |

How inheritance works:

```javascript
// BasePage.js
class BasePage {
  constructor(page) {
    this.page = page;
  }
  async click(locator) {
    await this._resolve(locator).click();
  }
}

// LoginPage.js EXTENDS BasePage
class LoginPage extends BasePage {
  constructor(page) {
    super(page); /* define locators */
  }
  async login(u, p) {
    await this.click(this.loginButton);
  } // uses BasePage!
}
```

---

`pages/LoginPage.js` — Login Page Object

Purpose: Handles login and error retrieval.

Locators (MIXED strategy — a teaching feature of this framework):

```javascript
this.usernameInput = page.getByPlaceholder("Username"); // built-in
this.passwordInput = page.locator("#password"); // CSS
this.loginButton = page.getByRole("button", { name: "Login" }); // built-in role
this.errorMessage = page.locator('[data-test="error"]'); // CSS attribute
this.errorButton = page.locator("//button[@class='error-button']"); // XPath
this.loginLogo = page.locator("//div[@class='login_logo']"); // XPath
```

Key Methods:

| Method                      | Purpose                                                 |
| --------------------------- | ------------------------------------------------------- |
| `open()`                    | Navigate to the login page                              |
| `login(username, password)` | Full login flow, wrapped in `test.step()` + Winston log |
| `getErrorMessage()`         | Read the displayed error text                           |
| `hasError()`                | Whether an error is visible                             |

---

`pages/InventoryPage.js` — Products Page Object

Purpose: Product listing, sorting, add/remove to cart, navigation.

Key Methods: `addToCartButton(name)`, `removeButton(name)`, `addProductToCart`, `removeProductFromCart`, `addMultipleProducts`, `getProductCount`, `getProductNames`, `getProductPrices`, `sortBy`, `getCartCount`, `goToCart`, `openProductDetails`, `logout`, `isLoaded`. Uses `slugify` (stringUtils) to build `data-test` ids.

---

`pages/CartPage.js` — Cart Page Object

Purpose: Cart validation, remove items, continue shopping, proceed to checkout.

Key Methods: `removeButton(name)`, `getCartItemNames`, `getCartItemPrices`, `getItemCount`, `proceedToCheckout`, `continueShopping`, `isLoaded`. Uses `parsePrice`/`slugify`.

---

`pages/CheckoutPage.js` — Checkout Page Object

Purpose: Checkout step one (customer info) and step two (overview/totals).

Key Methods: `fillCustomerInfo(first, last, zip)`, `continue`, `cancel`, `finish`, `getErrorMessage`, `getSubtotal`, `getTax`, `getTotal`. Uses `parsePrice` and a mix of `getByPlaceholder`, CSS, and XPath locators.

---

`pages/CheckoutCompletePage.js` — Order Confirmation Page Object

Purpose: Verify the "Thank you for your order!" confirmation.

Key Methods: `getHeaderText`, `getCompleteText`, `isOrderComplete`, `backHome`.

---

`tests/` — Test Spec Files

Purpose: All test scenarios organized by feature/module.

Structure:

```
tests/
├── login/         positiveLogin, negativeLogin (data-driven), logout
├── inventory/     inventory.spec.js
├── cart/          cart.spec.js
├── checkout/      checkout.spec.js (test.step + expect.soft)
├── unit/          stringUtils / dataGenerator / dateUtils / waitUtils
```

Test File Pattern:

```javascript
// 1. Import custom fixtures (NOT base @playwright/test)
import { test, expect } from "../../fixtures/baseFixture.js";
// 2. Import data reader + data / constants / config
import { readJSON } from "../../utils/dataReader.js";
import { MESSAGES } from "../../utils/constants.js";
import env from "../../config/env.config.js";

const loginData = readJSON("loginData.json");

test.describe("Login - Negative @regression", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  // Data-Driven loop
  for (const data of loginData.invalidCredentials) {
    test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
      await loginPage.login(data.username, data.password);
      expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
    });
  }
});
```

Tagging System: Tests use tags in their titles for selective execution:

- `@smoke` — Quick critical tests
- `@regression` — Full suite
- `@unit` — Pure utility tests

Run by tag: `npm run test:smoke` → only `@smoke` tests.

---

`test-data/` — External Test Data Files

Purpose: Store test data outside test logic for data-driven testing.

`test-data/loginData.json`

```json
{
  "validLogin": { "username": "standard_user", "password": "secret_sauce" },
  "invalidCredentials": [
    {
      "testId": "TC_LOGIN_01",
      "username": "invalid_user",
      "password": "secret_sauce",
      "expectedError": "Epic sadface: Username and password do not match any user in this service"
    }
  ],
  "emptyCredentials": [
    {
      "testId": "TC_LOGIN_04",
      "username": "",
      "password": "secret_sauce",
      "expectedError": "Epic sadface: Username is required"
    }
  ]
}
```

Other files: `users.json` (user accounts), `checkoutData.json` (valid/invalid customers), `products.json` (product names + prices).

How it is used in tests:

```javascript
const loginData = readJSON("loginData.json");
for (const data of loginData.invalidCredentials) {
  /* ... */
}
```

---

`utils/` — Utility Layer

---

`utils/logger.js` — Winston Structured Logging

Purpose: Timestamped, level-based logging to console + files.

Outputs: `logs/test-execution.log` (all levels) and `logs/error.log` (errors only).

```javascript
import logger from "../utils/logger.js";
logger.info("Attempting login with username: standard_user");
```

---

`utils/dataReader.js` — JSON/CSV Readers

Purpose: Read external data files. Uses `fileURLToPath` for ESM `__dirname`.

Methods: `readJSON(fileName)`, `readCSV(fileName)`.

---

`utils/constants.js` — Shared Constants

Purpose: Central place for `ROUTES`, `MESSAGES`, `SORT_OPTIONS`, `TITLES`, `EXPECTED_PRODUCT_COUNT` — avoids magic strings scattered through tests.

---

`utils/waitUtils.js` — Smart Waits & Retry

Purpose: Avoid hard-coded sleeps; provide condition-based waits and retry.

Methods: `retry(fn, {retries, delay, name})`, `waitUntil(cond, {timeout, interval})`, `sleep(ms)`.

---

`utils/dataGenerator.js` — Random Data (Faker-style)

Purpose: Generate unique data per run to avoid collisions.

Methods: `randomInt`, `randomFrom`, `randomString`, `firstName`, `lastName`, `fullName`, `email`, `postalCode`, `phoneNumber`, `customer`.

---

`utils/dateUtils.js` — Date/Time Helpers

Methods: `timestamp`, `today`, `addDays`, `format`, `fileTimestamp`.

---

`utils/stringUtils.js` — String/Number Helpers

Methods: `parsePrice` (`"$29.99"` → `29.99`), `toCurrency`, `capitalize`, `slugify` (`"Sauce Labs Backpack"` → `sauce-labs-backpack`), `normalizeSpaces`, `containsIgnoreCase`.

---

`utils/fileUtils.js` — Filesystem & Downloads

Methods: `fromRoot`, `exists`, `ensureDir`, `readText`, `writeText`, `appendText`, `deleteFile`, `fileSize`, `saveDownload`.

---

`utils/assertionUtils.js` — Readable Assertion Wrappers

Methods: `assertEquals`, `assertTrue`, `assertFalse`, `assertContains`, `assertVisible`, `assertHasText`, `assertUrlContains`.

---

`reports/`, `logs/`, `test-results/` — Generated Output

| Path                                    | Content                                    | Generated By                       |
| --------------------------------------- | ------------------------------------------ | ---------------------------------- |
| `reports/html-report/index.html`        | HTML report                                | `html` reporter (`npm run report`) |
| `reports/json-report/results.json`      | JSON results                               | `json` reporter                    |
| `reports/junit-report/results.xml`      | JUnit results                              | `junit` reporter (CI)              |
| `reports/allure-results/`               | Allure raw data + `environment.properties` | `allure-playwright` + global-setup |
| `logs/test-execution.log` / `error.log` | Winston logs                               | `utils/logger.js`                  |
| `test-results/`                         | Traces, videos, failure screenshots        | Playwright                         |

Allure: `npm run allure:generate` → `npm run allure:open` (or one-shot `npm run allure:serve`).

---

`Jenkinsfile`, `.github/workflows/playwright.yml` — CI/CD

- Jenkinsfile — declarative pipeline with `BROWSER`/`SUITE` parameters; stages: checkout → install → browsers → test → Allure; post steps publish JUnit/Allure/HTML.
- GitHub Actions — matrix across chromium/firefox/webkit, uploads artifacts, publishes a merged Allure report.

---

`package.json` — Dependencies & Scripts

Key scripts:

| Script                                          | Purpose                                 |
| ----------------------------------------------- | --------------------------------------- |
| `npm test`                                      | Run all tests                           |
| `npm run test:smoke` / `test:regression`        | Tag-based runs                          |
| `npm run test:chromium/firefox/webkit`          | Browser-specific                        |
| `npm run test:login/inventory/cart/checkout`    | Module-wise                             |
| `npm run test:unit`                             | Utility unit tests (no browser)         |
| `npm run test:dev/qa/staging`                   | Multi-environment (`cross-env ENV=...`) |
| `npm run report` / `allure:generate/open/serve` | Reporting                               |
| `npm run clean`                                 | Remove generated output                 |

Key dev dependencies: `@playwright/test`, `allure-playwright`, `allure-commandline`, `cross-env`, `dotenv`, `rimraf`, `winston`.

Note: `"type": "module"` — the whole framework uses ES Modules (`import`/`export`).

---

3. Framework Architecture

Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRAMEWORK ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐     ┌──────────────┐     ┌───────────────┐  │
│   │ playwright   │────▶│ config/      │────▶│ environments/ │  │
│   │ .config.js   │     │ env.config.js│     │ dev/qa/staging│  │
│   └──────┬───────┘     └──────────────┘     └───────────────┘  │
│          │                                                     │
│          ├──▶ global-setup.js ──▶ Allure environment.properties│
│          ▼                                                      │
│   ┌──────────────┐     ┌──────────────────────────────────────┐ │
│   │ fixtures/    │     │         PAGE OBJECTS (POM)           │ │
│   │ baseFixture  │────▶│                                      │ │
│   │ (+data/      │     │  BasePage.js (parent - 30+ methods)  │ │
│   │  auto-login/ │     │        ▲        ▲         ▲          │ │
│   │  afterEach)  │     │        │        │         │          │ │
│   └──────┬───────┘     │  LoginPage  InventoryPage CartPage   │ │
│          │              │  CheckoutPage  CheckoutCompletePage  │ │
│          │              └──────────────────────────────────────┘ │
│          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    TEST DATA                              │  │
│   │  loginData.json  users.json  checkoutData.json products  │  │
│   └──────────────────────────────────────────────────────────┘  │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    TEST SPECS                             │  │
│   │  login/ inventory/ cart/ checkout/                       │  │
│   │  unit/                                                    │  │
│   └──────┬───────────────────────────────────────────────────┘  │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    UTILITIES                              │  │
│   │  logger  dataReader  constants  waitUtils  dataGenerator │  │
│   │  dateUtils  stringUtils  fileUtils  assertion            │  │
│   └──────┬───────────────────────────────────────────────────┘  │
│          │                                                       │
│          ▼                                                       │
│   ┌──────────────────────────────────────────────────────────┐  │
│   │                    REPORTERS                              │  │
│   │  List  │  HTML  │  JSON  │  JUnit  │  Allure             │  │
│   └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│   Cross-cutting: CI/CD (Jenkins + GitHub Actions)               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

POM Structure (Page Object Model)

```
                    BasePage.js
                 (30+ generic methods)
                        │
        ┌───────────────┼───────────────┐
        │        │        │        │        │
   LoginPage  InventoryPage  CartPage  CheckoutPage  CheckoutCompletePage

Each child page:
  1. extends BasePage (inherits all wrappers)
  2. Defines its OWN MIXED locators (built-in + CSS + XPath) in constructor
  3. Defines its OWN business methods
  4. Uses BasePage methods internally + logs via Winston
```

Locator Strategy (Teaching Feature)

Page Objects deliberately use a mix of locator strategies, as in real projects:

| Strategy             | Example                                                               | When to use                    |
| -------------------- | --------------------------------------------------------------------- | ------------------------------ |
| Built-in (preferred) | `getByRole('button', {name:'Login'})`, `getByPlaceholder('Username')` | User-facing, resilient         |
| CSS                  | `#password`, `[data-test="error"]`                                    | Stable ids / attributes        |
| XPath                | `//button[@data-test='cancel']`                                       | When CSS is awkward / teaching |

Reusability Concept

- BasePage → used by ALL page objects
- logger → used across pages, fixtures, setup
- Fixtures → auto-inject page objects into ALL tests
- env.config.js → single source of truth for config
- Test Data → shared JSON files
- Utils → available anywhere via `import`

Data Handling Strategy

| Source              | Used For                             | How                                 |
| ------------------- | ------------------------------------ | ----------------------------------- |
| JSON files          | Credentials, checkout data, products | `readJSON('loginData.json')`        |
| env config          | URLs, users, timeouts                | `env.baseURL`, `env.users.standard` |
| Random generator    | Unique customers/emails              | `data.customer()`                   |
| .env / environments | Environment switching                | `ENV=staging`                       |

Reporting Strategy

| Reporter | Type                          | View Command                            |
| -------- | ----------------------------- | --------------------------------------- |
| List     | Console                       | Automatic                               |
| HTML     | Playwright built-in           | `npm run report`                        |
| JSON     | Machine-readable              | open `reports/json-report/results.json` |
| JUnit    | CI summaries                  | consumed by CI                          |
| Allure   | Rich interactive (+ env info) | `npm run allure:serve`                  |

Environment Handling

```
ENV=dev      → config/environments/dev.json
ENV=qa       → config/environments/qa.json      (default)
ENV=staging  → config/environments/staging.json
```

Switch: `npm run test:staging`

Parallel & Cross-Browser Execution

- `fullyParallel: true`; workers auto (or 2 on CI)
- 3 projects: chromium, firefox, webkit
- Run one: `npm run test:chromium` — Run all: `npm test`

---

4. Test Execution Flow

Step-by-Step Execution Flow

Step 1: CLI Command Starts

```bash
npm test           # or npm run test:smoke / test:staging
```

Step 2: Playwright Reads `playwright.config.js`

- Loads `dotenv` and imports the resolved `env` object from `config/env.config.js`
- Sets testDir, timeouts, reporters, projects, and `globalSetup`

Step 3: Global Setup Runs (once)

- `global-setup.js` writes `reports/allure-results/environment.properties`

Step 4: Test Discovery

- Scans `tests/` recursively (login, inventory, cart, checkout, unit)
- Builds the plan: matching tests × browser projects

Step 5: Worker Allocation

- `fullyParallel: true`; workers run specs in parallel processes

Step 6: Browser Launch (per worker)

- Launches chromium/firefox/webkit; `headless = env.headless`; new context + page

Step 7: Fixture Initialization

- `baseFixture.js` creates the requested page objects (and `data`/`loggedInPage`)
- Each page calls `super(page)` → BasePage stores `this.page`

Step 8: Hooks Execute

- `beforeEach` (in specs) opens the page or auto-logs in via `loggedInPage`

Step 9: Test Data Loads

- `readJSON(...)` and/or `data.customer()` provide inputs; data-driven `for...of` loops create parameterized tests

Step 10: Test Execution

- Spec → Page Object action (wrapped in `test.step()`) → BasePage wrapper → Playwright API
- Winston logs each action; assertions use `expect(...)` / `expect.soft(...)`

Step 11: Global afterEach

- On failure: full-page screenshot attached to the report; Playwright retains trace/video/screenshot

Step 12: Retry on Failure

- Locally, a failed test retries once; on CI, it retries twice. Each attempt reruns the test and its fixtures. A later pass is marked flaky in Allure, while a test that fails every attempt remains failed.

Step 13: Report Generation

- list (console), HTML, JSON, JUnit auto-generated; Allure via `allure:generate/open/serve`

Visual Flow Diagram

```
npm test
   │
   ▼
playwright.config.js ──▶ dotenv + env.config.js (ENV → environments/<ENV>.json)
   │
   ▼
global-setup.js ──▶ Allure environment.properties
   │
   ▼
Scan tests/ ──▶ Find *.spec.js
   │
   ▼
Create Workers ──▶ Allocate tests (parallel)
   │
   ▼
Launch Browsers ──▶ chromium / firefox / webkit
   │
   ▼
For Each Test:
   │
   ├── baseFixture.js ──▶ Create Page Objects (+ data / loggedInPage)
   │
   ├── beforeEach ──▶ open page or auto-login
   │
   ├── Test Execution ──▶ Spec → Page Object (test.step) → BasePage → Playwright API
   │         │
   │         ├── readJSON(...) / data.customer()   (Test Data)
   │         └── logger.js                          (Structured Logging)
   │
   └── afterEach ──▶ (on failure) screenshot attached
   │
   ▼
Generate Reports
   ├── List (console)
   ├── HTML (reports/html-report/)
   ├── JSON (reports/json-report/results.json)
   ├── JUnit (reports/junit-report/results.xml)
   └── Allure (reports/allure-results/) → allure generate → allure-report/
```

---

5. How to Explain This Framework in Interview

Beginner Level Explanation (1-2 minutes)

> "I built an automation framework using Playwright with JavaScript (ES Modules) for the SauceDemo app. I used the Page Object Model — each page has its own class with locators and methods. I keep test data in JSON files for data-driven testing, so I can add cases without changing code. The framework has multi-environment configs (dev/qa/staging), Winston logging, and generates Allure reports with screenshots on failure."

Key words: Playwright, ES Modules, POM, data-driven, multi-environment, Allure.

---

Intermediate Level Explanation (3-5 minutes)

> "I designed a Data-Driven framework using Playwright + JavaScript (ESM) combining POM, Data-Driven, and a modular utility layer.
>
> A BasePage class wraps every Playwright interaction (click, fill, hover, select, waits, screenshots) and logs each action with Winston. All five page objects (Login, Inventory, Cart, Checkout, CheckoutComplete) extend BasePage and use a deliberate mix of locators — built-in (`getByRole`/`getByPlaceholder`), CSS, and XPath.
>
> I use custom fixtures for dependency injection — page objects are injected automatically, plus a `loggedInPage` auto-login fixture and a `data` fixture for random data. A global `afterEach` attaches a screenshot on failure.
>
> Configuration is multi-environment: `config/env.config.js` loads `environments/<ENV>.json` and merges with `.env` overrides. `global-setup.js` writes Allure environment info.
>
> Reporting uses five reporters — list, HTML, JSON, JUnit, and Allure — with trace/video/screenshots retained on failure. I also added unit tests for utilities, and it runs on Jenkins + GitHub Actions."

---

Advanced Level Explanation (5-10 minutes)

> "I architected a Data-Driven E2E framework on Playwright with JavaScript ES Modules, in clear layers.
>
> Configuration Layer: `playwright.config.js` imports a single resolved `env` object from `config/env.config.js`, which reads the `ENV` variable, loads `environments/<ENV>.json`, and merges with `.env` and defaults. `global-setup.js` writes `environment.properties` so Allure shows the exact environment, browser, OS, and Node version.
>
> Page Object Layer: A `BasePage` provides 30+ generic, logged wrappers over Playwright. Five child pages extend it, each defining mixed locators (built-in + CSS + XPath) and business methods composed from BasePage primitives — e.g. `login()` wraps `fill` + `click` inside a `test.step()`.
>
> Fixture Layer: `baseFixture.js` extends `base.test` to inject page objects and provides `loggedInPage` (auto-login) and `data` (random generator). A global `afterEach` attaches failure screenshots.
>
> Test Data Layer: JSON files drive parameterized `for...of` tests; `dataGenerator` produces unique data per run to avoid collisions in parallel execution.
>
> Utility Layer: Nine modules — `logger` (Winston), `dataReader`, `constants`, `waitUtils` (retry/waitUntil, no hard sleeps), `dataGenerator`, `dateUtils`, `stringUtils`, `fileUtils`, `assertionUtils`.
>
> Test Layer: Organized by feature and split further (login split into positive/negative/logout). Long checkout flows use `test.step()` grouping and `expect.soft()` so a single run reports all failures. Tagging (`@smoke`, `@regression`, `@unit`) enables selective execution.
>
> Quality & Extras: Unit tests for utilities.
>
> Reporting Layer: Five reporters (list/HTML/JSON/JUnit/Allure) with trace/video/screenshot on failure.
>
> CI/CD: A `Jenkinsfile` (parameterized) and a GitHub Actions matrix run cross-browser and publish Allure."

---

Real-Time Project Explanation

> "The application under test is SauceDemo, an e-commerce demo with Login, Product Inventory, Cart, and Checkout modules.
>
> I built the framework from scratch in modern ESM JavaScript. We have 30-40 test cases across login (positive/negative/logout, data-driven), inventory (sorting, add/remove), cart, checkout (data-driven + random data + soft assertions), plus a unit test suite.
>
> Daily workflow:
>
> 1. Developer pushes → CI pipeline triggers (Jenkins / GitHub Actions)
> 2. Smoke tests run first (`@smoke`), then regression
> 3. Allure report is generated with environment info and shared
> 4. Failures are triaged using the attached screenshot, trace, and video
>
> Key decisions:
>
> - ES Modules over CommonJS for a modern codebase
> - Multi-environment JSON config for easy env switching
> - Mixed locators to teach when to use built-in vs CSS vs XPath
> - Custom fixtures (incl. auto-login, data) for clean tests
> - Allure over basic HTML for richer debugging context
> - Added a unit test layer to make it a real, well-rounded framework"

---

Quick 2-Minute Interview Answer

> "I built a Data-Driven framework using Playwright + JavaScript (ES Modules) + POM for SauceDemo.
>
> It has a BasePage with 30+ reusable logged methods, five page objects extending it with mixed locators (built-in + CSS + XPath), custom fixtures for DI (plus auto-login and data fixtures), multi-environment config (dev/qa/staging), Winston logging, and five reporters (List, HTML, JSON, JUnit, Allure) with trace/video/screenshots on failure.
>
> Data-driven tests loop over external JSON. I added a unit test suite and set up Jenkins + GitHub Actions CI. It runs cross-browser (Chromium/Firefox/WebKit) in parallel with tag-based selective execution."

---
