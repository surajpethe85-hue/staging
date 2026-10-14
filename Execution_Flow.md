Execution Flow — SauceDemo Data-Driven Framework

Complete Step-by-Step Execution Flow

This document explains exactly what happens when you run a test in this framework —
from the CLI command to the final report — covering every real file and function involved
(`playwright.config.js`, `global-setup.js`, `config/env.config.js`, `fixtures/baseFixture.js`,
the Page Objects, `BasePage.js`, the utility layer, and the reporters).

---

Visual Flow Diagram

```
╔═══════════════════════════════════════════════════════════════════════╗
║              SAUCEDEMO FRAMEWORK — EXECUTION FLOW                     ║
╠═══════════════════════════════════════════════════════════════════════╣
║                                                                       ║
║  1. CLI COMMAND                                                       ║
║     npm test  /  npm run test:smoke  /  npm run test:staging          ║
║         │                                                             ║
║         ▼                                                             ║
║  2. PLAYWRIGHT ENGINE STARTS                                          ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  Reads playwright.config.js                     │               ║
║     │  ├── import 'dotenv/config'  (loads .env)       │               ║
║     │  ├── import env from config/env.config.js       │               ║
║     │  │     └── loads config/environments/<ENV>.json │               ║
║     │  ├── Sets: testDir, timeout, expect, retries    │               ║
║     │  ├── globalSetup: './global-setup.js'           │               ║
║     │  ├── Reporters: list+html+json+junit+allure     │               ║
║     │  └── Projects: chromium / firefox / webkit      │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  3. GLOBAL SETUP (runs ONCE)                                          ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  global-setup.js                                │               ║
║     │  └── writes reports/allure-results/             │               ║
║     │        environment.properties (env, browser,    │               ║
║     │        OS, node version, base URL, timestamp)   │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  4. TEST DISCOVERY                                                    ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  Scans tests/ recursively:                      │               ║
║     │  login/ inventory/ cart/ checkout/ unit/        │               ║
║     │  Plan = (matching tests) × (browser projects)   │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  5. WORKER ALLOCATION                                                 ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  fullyParallel: true                            │               ║
║     │  workers: CI ? 2 : undefined (auto = CPU cores) │               ║
║     │  Each worker runs one spec at a time, parallel  │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  6. BROWSER LAUNCH (per worker)                                       ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  Launch per project: chromium/firefox/webkit    │               ║
║     │  headless = env.headless                        │               ║
║     │  viewport 1366×768, ignoreHTTPSErrors: true     │               ║
║     │  trace/screenshot/video: retain-on-failure      │               ║
║     │  New BrowserContext + Page                      │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  7. FIXTURE INITIALIZATION (Dependency Injection)                     ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  fixtures/baseFixture.js provides:              │               ║
║     │  ├── loginPage      = new LoginPage(page)       │               ║
║     │  ├── inventoryPage  = new InventoryPage(page)   │               ║
║     │  ├── cartPage       = new CartPage(page)        │               ║
║     │  ├── checkoutPage   = new CheckoutPage(page)    │               ║
║     │  ├── checkoutCompletePage = new ...(page)       │               ║
║     │  ├── loggedInPage   → auto-login standard user  │               ║
║     │  └── data = dataGenerator                       │               ║
║     │  Each page → super(page) → BasePage stores page │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  8. TEST DATA LOADS                                                   ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  readJSON('loginData.json') via utils/dataReader│               ║
║     │  env.users.standard / env.password              │               ║
║     │  data.customer() → unique random data           │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  9. TEST EXECUTION                                                    ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  Spec → Page Object action → BasePage wrapper   │               ║
║     │  → Playwright locator API                       │               ║
║     │  test.step() groups steps; Winston logs actions │               ║
║     │  Assertions: expect(...) / expect.soft(...)     │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  10. GLOBAL afterEach HOOK                                            ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  In baseFixture.js:                             │               ║
║     │  IF status !== expectedStatus (FAILED):         │               ║
║     │  ├── Winston warns                              │               ║
║     │  └── page.screenshot() → testInfo.attach(...)   │               ║
║     └─────────────────────┬───────────────────────────┘               ║
║                           ▼                                           ║
║  11. RETRY ON FAILURE (local: 1, CI: 2 retries)                       ║
║                           ▼                                           ║
║  12. REPORT GENERATION                                                ║
║     ┌─────────────────────────────────────────────────┐               ║
║     │  list → console                                 │               ║
║     │  html  → reports/html-report/                   │               ║
║     │  json  → reports/json-report/results.json       │               ║
║     │  junit → reports/junit-report/results.xml       │               ║
║     │  allure→ reports/allure-results/ (raw)          │               ║
║     │  npm run allure:generate / allure:open          │               ║
║     └─────────────────────────────────────────────────┘               ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝
```

---

Detailed Flow for Each Step

---

Step 1: CLI Command Starts

```bash
# Run all tests on all browsers
npm test

# Tag-based selection
npm run test:smoke          # --grep @smoke
npm run test:regression     # --grep @regression

# Browser-specific
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Module-wise
npm run test:login
npm run test:inventory
npm run test:cart
npm run test:checkout

# Specialized suites
npm run test:unit           # utility unit tests (no browser)

# Multi-environment
npm run test:dev            # ENV=dev
npm run test:qa             # ENV=qa
npm run test:staging        # ENV=staging
```

What happens internally:

1. `npm` runs the matching script from `package.json`.
2. The script calls `npx playwright test` (optionally with `--grep`, a folder, or `cross-env ENV=...`).
3. Playwright CLI loads `playwright.config.js` from the project root.

---

Step 2: Playwright Reads Configuration

File: `playwright.config.js`

```
                    playwright.config.js
                          │
        ┌─────────────────┼──────────────────┐
        │                 │                   │
  import 'dotenv/config'   env.config.js    Reporters + Projects
        │                 │                   │
   loads .env into    resolves the active   list / html / json /
   process.env        environment object    junit / allure
```

Environment resolution (`config/env.config.js`):

```javascript
// 1. Which environment? (default 'qa')
const ENV_NAME = process.env.ENV || "qa";

// 2. Load config/environments/<ENV>.json
const fileConfig = loadEnvFile(); // dev.json | qa.json | staging.json

// 3. Merge order:  ENV file  ->  .env variables  ->  hard-coded defaults
const env = {
  name: fileConfig.name || ENV_NAME,
  baseURL:
    process.env.BASE_URL || fileConfig.baseURL || "https://www.saucedemo.com",
  password: process.env.PASSWORD || fileCreds.password || "secret_sauce",
  users: { standard, lockedOut, problem, performance, error },
  timeouts: { test, expect, action, navigation },
  headless: process.env.HEADLESS !== "false",
};
```

The config then uses this object directly:

```javascript
timeout: env.timeouts.test,
expect:  { timeout: env.timeouts.expect },
use: {
  baseURL: env.baseURL,
  actionTimeout: env.timeouts.action,
  navigationTimeout: env.timeouts.navigation,
  headless: env.headless,
  trace: 'retain-on-failure',
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
},
globalSetup: './global-setup.js',
```

---

Step 3: Global Setup (runs ONCE before all tests)

File: `global-setup.js`

```
globalSetup()
    │
    ├── mkdir reports/allure-results
    │
    └── write environment.properties:
        Environment   = qa
        Base.URL      = https://www.saucedemo.com
        Browser       = chromium
        Node.Version  = v20.x
        OS            = Windows_NT ...
        CI            = false
        Executed.At   = 2026-07-26T...
```

This is what makes the Allure report show the environment the run executed against.

---

Step 4: Test Discovery

```
Playwright scans: tests/
    │
    ├── login/       positiveLogin.spec.js  negativeLogin.spec.js  logout.spec.js
    ├── inventory/   inventory.spec.js
    ├── cart/        cart.spec.js
    ├── checkout/    checkout.spec.js
    └── unit/        stringUtils / dataGenerator / dateUtils / waitUtils

Plan = (matching tests) × (browser projects: chromium, firefox, webkit)
```

With tag filtering (`--grep @smoke`): only tests whose title contains `@smoke` are selected.
Tags used in this framework: `@smoke`, `@regression`, `@unit`.

---

Step 5: Worker Allocation

```
┌──────────────────────────────────────────────┐
│  fullyParallel: true                          │
│  workers: CI ? 2 : undefined (auto)           │
│                                               │
│  Worker 1          Worker 2         Worker N  │
│  positiveLogin     inventory        checkout  │
│  negativeLogin     cart                        │
│                                               │
│  Each worker runs specs SEQUENTIALLY          │
│  Different workers run IN PARALLEL            │
└──────────────────────────────────────────────┘
```

---

Step 6: Browser Launch (per worker)

```
Worker (chromium project):
    │
    ├── Launch Chromium (headless = env.headless)
    │
    ├── Create BrowserContext
    │   ├── viewport 1366×768
    │   ├── ignoreHTTPSErrors: true
    │   ├── screenshot: only-on-failure
    │   ├── video: retain-on-failure
    │   └── trace: retain-on-failure
    │
    └── Create new Page → passed into fixtures
```

---

Step 7: Fixture Initialization (Dependency Injection)

File: `fixtures/baseFixture.js`

```javascript
test('TC_LOGIN_VALID ...', async ({ loginPage, inventoryPage }) => { ... });
//                                   ^^^^^^^^^  ^^^^^^^^^^^^^  from fixtures
```

Flow:

```
Test requests: { loginPage }
        │
        ▼
baseFixture.js:
  loginPage: async ({ page }, use) => {
        ├── receives 'page' from Playwright
        ├── const loginPage = new LoginPage(page)
        │       └── LoginPage constructor:
        │           super(page)  ─▶ BasePage stores this.page = page
        │           // defines MIXED locators:
        │           this.usernameInput = page.getByPlaceholder('Username')  // built-in
        │           this.passwordInput = page.locator('#password')           // CSS
        │           this.loginButton   = page.getByRole('button',{name:'Login'})
        │           this.errorButton   = page.locator("//button[@class='error-button']") // XPath
        └── await use(loginPage)  ─▶ injected into the test
  }
```

Special fixtures:

```
loggedInPage → opens login page, logs in as standard user, waits for /inventory/
data         → dataGenerator (unique random data)
```

---

Step 8: Test Data Loads

```javascript
// utils/dataReader.js
import { readJSON } from "../../utils/dataReader.js";
const loginData = readJSON("loginData.json");

// From environment config
env.users.standard; // "standard_user"
env.password; // "secret_sauce"

// From the data fixture / generator
const cust = data.customer(); // { firstName, lastName, email, postalCode, phone }
```

Data-Driven pattern (negative login):

```javascript
for (const data of loginData.invalidCredentials) {
  test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
    await loginPage.login(data.username, data.password);
    expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
  });
}
```

---

Step 9: Test Execution — Method Call Chain

When a test calls `await loginPage.login('standard_user', 'secret_sauce')`:

```
Test Code: await loginPage.login('standard_user', 'secret_sauce')
    │
    ▼
LoginPage.login(username, password):
    └── test.step(`Login as "standard_user"`, async () => {
          ├── logger.info('Attempting login ...')          // Winston
          │
          ├── await this.fill(this.usernameInput, username)
          │       └── BasePage.fill(locator, value):
          │           ├── logger action log
          │           └── locator.fill(value)              // Playwright API
          │
          ├── await this.fill(this.passwordInput, password)
          │       └── page.locator('#password').fill(...)
          │
          └── await this.click(this.loginButton)
                  └── BasePage.click(locator):
                      └── page.getByRole('button',{name:'Login'}).click()
        })
```

Assertion flow:

```
expect(await inventoryPage.isLoaded()).toBeTruthy()
    │
    ├── inventoryPage.isLoaded():
    │     └── BasePage.isVisible(this.pageTitle) → locator('.title').isVisible()
    │
    └── expect(true).toBeTruthy() → ✅ PASS

// Soft assertions in long checkout flows:
expect.soft(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
expect.soft(await checkoutCompletePage.getHeaderText()).toBe(MESSAGES.ORDER_COMPLETE_HEADER);
// → both are evaluated; the run reports ALL failures, not just the first.
```

---

Step 10: Global afterEach Hook

File: `fixtures/baseFixture.js`

```
test.afterEach(async ({ page }, testInfo) => {
    │
    IF testInfo.status !== testInfo.expectedStatus  (i.e. FAILED):
    ├── logger.warn(`Test failed: "${title}" — attaching screenshot`)
    └── const shot = await page.screenshot({ fullPage: true })
        await testInfo.attach('failure-screenshot', {
          body: shot, contentType: 'image/png'
        })
})
```

Plus, Playwright itself (from config) retains trace, video, and screenshot
on failure after each test.

---

Step 11: Retry on Failure

```
retries: process.env.CI ? 2 : 1

TC fails locally → Attempt 2 (fresh test attempt and fixtures)
TC fails on CI   → Attempts 2 and 3
                 → a later pass is marked "flaky"; failure on all attempts remains "failed"
```

---

Step 12: Report Generation

```
After ALL tests complete:
    │
    ├── list   → console output during the run
    ├── html   → reports/html-report/index.html      (npm run report)
    ├── json   → reports/json-report/results.json
    ├── junit  → reports/junit-report/results.xml     (CI test summaries)
    └── allure → reports/allure-results/*.json  +  environment.properties
            │
            ├── npm run allure:generate  → reports/allure-report/
            ├── npm run allure:open      → opens the HTML report
            └── npm run allure:serve     → one-shot generate + open
```

---

Example: Full Checkout E2E Flow

Complete flow for a valid checkout test (`tests/checkout/checkout.spec.js`):

```
1. npm run test:checkout
       │
2. Config loads → ENV (qa) → env.config.js → chromium
       │
3. global-setup.js writes environment.properties
       │
4. Browser launches (headless per env)
       │
5. Fixtures create: loginPage, inventoryPage, cartPage,
   checkoutPage, checkoutCompletePage
       │
6. beforeEach:
   ├── loggedInPage → auto-login standard_user
   ├── inventoryPage.addProductToCart('Sauce Labs Backpack')
   ├── inventoryPage.goToCart()
   └── cartPage.proceedToCheckout()
       │
7. test.step('Fill customer information and continue'):
   ├── checkoutPage.fillCustomerInfo(first, last, zip)
   │     └── getByPlaceholder('First Name').fill(...) etc.
   └── checkoutPage.continue()
       │
8. test.step('Verify overview then finish'):
   ├── expect(checkoutPage.pageTitle).toHaveText('Checkout: Overview')
   └── checkoutPage.finish()
       │
9. test.step('Verify order confirmation'):
   ├── expect.soft(isOrderComplete).toBeTruthy()
   └── expect.soft(getHeaderText).toBe('Thank you for your order!')
       │
10. afterEach → (on failure) screenshot attached to report
       │
11. Reports generated ✅  (html / json / junit / allure)
```

---

Execution Summary Table

| Step | Component    | File                                                                | Action                                |
| ---- | ------------ | ------------------------------------------------------------------- | ------------------------------------- |
| 1    | CLI          | Terminal                                                            | `npm test` / `npm run test:*`         |
| 2    | Config       | `playwright.config.js`                                              | Load dotenv + `env.config.js`         |
| 2b   | Environment  | `config/env.config.js` + `environments/*.json`                      | Resolve active environment            |
| 3    | Global setup | `global-setup.js`                                                   | Write Allure `environment.properties` |
| 4    | Discovery    | `tests/**/*.spec.js`                                                | Find matching test files              |
| 5    | Workers      | Playwright engine                                                   | Allocate parallel workers             |
| 6    | Browser      | Playwright engine                                                   | Launch chromium/firefox/webkit        |
| 7    | Fixtures     | `fixtures/baseFixture.js`                                           | Create page objects + data            |
| 8    | Data         | `utils/dataReader.js`, `test-data/*.json`, `utils/dataGenerator.js` | Load / generate data                  |
| 9    | Test         | `tests/**/*.spec.js` → Page Object → `pages/BasePage.js`            | Execute steps + assertions            |
| 10   | afterEach    | `fixtures/baseFixture.js`                                           | Screenshot on failure                 |
| 11   | Retry        | `playwright.config.js`                                              | Retry on CI (×2)                      |
| 12   | Reports      | Reporter plugins                                                    | list / html / json / junit / allure   |

---

Simplified One-Line Flow

```
CLI command → playwright.config.js → dotenv + env.config.js (ENV → environments/<ENV>.json)
→ global-setup.js (Allure env info) → discover tests → allocate workers → launch browsers
→ baseFixture.js creates page objects (+ data fixtures, auto-login) → load test data (JSON / generator)
→ execute test (Spec → Page Object → BasePage → Playwright API) → assertions (expect / expect.soft)
→ afterEach (screenshot on failure) → generate reports (list + html + json + junit + allure)
```

---

Key Files Reference

| Layer        | File(s)                                                                                                                                                       |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Config       | `playwright.config.js`, `config/env.config.js`, `config/environments/*.json`                                                                                  |
| Global setup | `global-setup.js`                                                                                                                                             |
| Fixtures     | `fixtures/baseFixture.js`                                                                                                                                     |
| Page Objects | `pages/BasePage.js` + `LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`, `CheckoutCompletePage`                                                        |
| Utilities    | `utils/logger.js`, `dataReader.js`, `constants.js`, `waitUtils.js`, `dataGenerator.js`, `dateUtils.js`, `stringUtils.js`, `fileUtils.js`, `assertionUtils.js` |
| Test Data    | `test-data/loginData.json`, `users.json`, `checkoutData.json`, `products.json`                                                                                |
| Tests        | `tests/{login,inventory,cart,checkout,unit}/`                                                                                                                 |
| CI/CD        | `Jenkinsfile`, `.github/workflows/playwright.yml`                                                                                                             |

```

```
