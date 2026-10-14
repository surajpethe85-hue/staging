Framework Interview Questions & Answers

SauceDemo Data-Driven Playwright Framework — Interview Preparation

This document contains 75+ real-time interview questions with detailed answers, code examples, and explanations covering every aspect of our framework (Playwright + JavaScript ES Modules + POM + Data-Driven).

---

Table of Contents

1. [Framework Architecture Questions](#1-framework-architecture-questions)
2. [Page Object Model (POM) & Locator Questions](#2-page-object-model-pom--locator-questions)
3. [Playwright Fixture Questions](#3-playwright-fixture-questions)
4. [Configuration & Environment Questions](#4-configuration--environment-questions)
5. [Reporting Questions](#5-reporting-questions)
6. [CI/CD Questions](#6-cicd-questions)
7. [Parallel & Cross-Browser Execution Questions](#7-parallel--cross-browser-execution-questions)
8. [Data-Driven Testing Questions](#8-data-driven-testing-questions)
9. [Unit Testing Questions](#9-unit-testing-questions)
10. [Real-Time Scenario-Based Questions](#10-real-time-scenario-based-questions)
11. [Basic / Frequently-Asked Questions](#11-basic--frequently-asked-questions)

---

1. Framework Architecture Questions

---

Q1: What type of automation framework have you built?

Answer:
I built a Data-Driven Framework using Playwright with JavaScript (ES Modules) for the SauceDemo e-commerce application. It combines three design patterns:

1. Page Object Model (POM) — Each page has its own class with locators and business methods; all extend a common `BasePage`.
2. Data-Driven Testing — Test data stored in external JSON files, consumed via `for...of` loops.
3. Modular/Utility-Based — A rich reusable utility layer (logger, waits, data generator, etc.).

```
Framework Stack: JavaScript (ESM) + Playwright + POM + Data-Driven + Allure
```

A key modern point: the whole framework uses ES Modules (`import`/`export`), not the legacy `require`/`module.exports`.

---

Q2: Explain the folder structure of your framework.

Answer:

```
saucedemo-framework/
├── config/          → env.config.js + environments/ (dev/qa/staging JSON)
├── fixtures/        → baseFixture.js (DI + auto-login + data + failure screenshot)
├── pages/           → BasePage + 5 page objects (Login, Inventory, Cart, Checkout, CheckoutComplete)
├── tests/           → login/ inventory/ cart/ checkout/ unit/
├── test-data/       → loginData, users, checkoutData, products (JSON)
├── utils/           → 10 utility modules (logger, dataReader, waitUtils, dataGenerator...)
├── reports/         → html-report, json-report, junit-report, allure-results
├── logs/            → Winston logs (test-execution.log, error.log)
├── global-setup.js  → writes Allure environment.properties
├── playwright.config.js → central configuration
├── Jenkinsfile / .github/workflows/ → CI/CD
└── package.json     → dependencies and scripts
```

The separation follows the Single Responsibility Principle — tests don't know infrastructure, pages don't know test data, utilities are independent.

---

Q3: What are the key components of your framework?

Answer:

| Component     | Purpose                                 | File                                           |
| ------------- | --------------------------------------- | ---------------------------------------------- |
| Configuration | Multi-env settings, timeouts, browsers  | `playwright.config.js`, `config/env.config.js` |
| Environments  | Per-env values (dev/qa/staging)         | `config/environments/*.json`                   |
| Global Setup  | Allure environment info                 | `global-setup.js`                              |
| Page Objects  | UI interaction methods per page         | `pages/*.js`                                   |
| Base Page     | 30+ reusable, logged wrapper methods    | `pages/BasePage.js`                            |
| Fixtures      | DI of page objects + data + auto-login  | `fixtures/baseFixture.js`                      |
| Test Data     | External data for data-driven testing   | `test-data/*.json`                             |
| Utilities     | logger, dataReader, waits, generator... | `utils/*.js`                                   |
| Test Specs    | Test scenarios (UI/unit)                | `tests/**/*.spec.js`                           |
| Reporters     | List, HTML, JSON, JUnit, Allure         | Configured in config                           |

---

Q4: Why did you choose Playwright over Selenium?

Answer:

| Feature               | Playwright                       | Selenium                     |
| --------------------- | -------------------------------- | ---------------------------- |
| Auto-wait             | Built-in                         | Needs explicit WebDriverWait |
| Speed                 | Faster (direct protocol)         | Slower (HTTP WebDriver)      |
| Cross-browser         | Chromium/Firefox/WebKit natively | Separate driver per browser  |
| Fixtures              | Built-in dependency injection    | Not available                |
| Trace Viewer          | Built-in debugging               | Not available                |
| API Testing           | Built-in `request` context       | Not available                |
| Network Interception  | Built-in `route()`               | Limited                      |
| Auto-retry assertions | `expect` auto-retries            | Manual                       |

Key reason: Playwright's auto-wait eliminates most flaky timing issues, and its built-in fixtures made my POM + DI design clean.

---

Q5: How do you handle code reusability?

Answer:
At multiple levels:

1. BasePage (Inheritance) — 30+ wrapper methods inherited by all page objects:

```javascript
class LoginPage extends BasePage {
  async login(u, p) {
    await this.click(this.loginButton);
  } // BasePage method
}
```

2. Fixtures (DI) — Page objects created once, injected everywhere.
3. Utilities — Shared across all layers (logger, waitUtils, stringUtils...).
4. env.config.js — Single source of truth for configuration.
5. Test Data — Shared JSON files used by multiple specs.

---

Q6: What design patterns have you used?

Answer:

1. Page Object Model — encapsulation of locators + actions.
2. Factory / Dependency Injection — fixtures create page objects on demand.
3. Singleton — the Winston logger is one shared instance.
4. Template Method — BasePage defines generic wrappers, pages compose them.
5. Strategy — different environment JSON files for different run strategies.

---

Q6a: Where have you applied the 4 OOP principles in your framework? (Very common)

Answer:
All four pillars of OOP are used in the POM layer — this is the answer interviewers love because it maps theory to real code.

1. Encapsulation — each page object hides its locators and exposes only meaningful actions. Tests never touch raw selectors.

```javascript
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.usernameInput = page.getByPlaceholder("Username"); // internal detail
    this.passwordInput = page.locator("#password");
  }
  async login(u, p) {
    // public behavior
    await this.fill(this.usernameInput, u);
    await this.fill(this.passwordInput, p);
    await this.click(this.loginButton);
  }
}
// test only knows: await loginPage.login(user, pass);
```

2. Inheritance — every page (`LoginPage`, `InventoryPage`, `CartPage`, `CheckoutPage`, `CheckoutCompletePage`) `extends BasePage` and reuses its 30+ wrapper methods via `super(page)`.

```javascript
class InventoryPage extends BasePage { ... }   // gets click/fill/getText/waitFor for free
```

3. Polymorphism — `BasePage` helpers like `_resolve()` accept either a string selector or a Locator object and behave correctly for both; and child pages can override a base method (e.g., a page-specific `open()`) while callers use the same method name.

```javascript
await this.click("#login-button"); // string
await this.click(this.loginButton); // Locator — same method, different input
```

4. Abstraction — `BasePage` abstracts away raw Playwright calls behind clean, logged methods, so pages/tests work at the business level, not the API level.

```javascript
async click(locator) {                       // hides logging + resolution + Playwright call
  logger.info(`Clicking: ${locator}`);
  await this._resolve(locator).click();
}
```

Supporting OOP concepts I can also mention:

- Constructor — `constructor(page) { super(page); ... }` initializes each page.
- `this` keyword — refers to the current page-object instance.
- `super` — calls the `BasePage` constructor/methods from a child.

One-liner: _"Encapsulation = locators hidden in page objects; Inheritance = all pages extend BasePage; Polymorphism = base methods accept string-or-Locator and pages can override; Abstraction = BasePage hides raw Playwright behind clean methods."_

---

Q7: Why ES Modules instead of CommonJS?

Answer:
The whole framework uses ES Modules (`import`/`export`) with `"type": "module"` in package.json.

- Modern, standard JavaScript (aligns with front-end code).
- Static imports enable better tooling and tree-shaking.
- Cleaner named exports for utilities.

One thing I handled: since ESM has no `__dirname`, I recreate it where needed:

```javascript
import { fileURLToPath } from "url";
import path from "path";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

---

2. Page Object Model (POM) & Locator Questions

---

Q8: What is Page Object Model? Why do you use it?

Answer:
POM is a design pattern where each page has a class containing its locators and methods.

Without POM (bad):

```javascript
await page.locator("#user-name").fill("standard_user");
await page.locator("#password").fill("secret_sauce");
await page.locator("#login-button").click();
```

With POM (good):

```javascript
await loginPage.login("standard_user", "secret_sauce");
```

If a locator changes, I update it in ONE place (the page object) instead of every test.

---

Q9: Explain BasePage and how inheritance works.

Answer:
`BasePage` is the parent class holding generic, logged wrappers over Playwright:

```javascript
class BasePage {
  constructor(page) {
    this.page = page;
  }
  async click(locator) {
    await this._resolve(locator).click();
  }
  async fill(locator, v) {
    await this._resolve(locator).fill(v);
  }
  async getText(locator) {
    return this._resolve(locator).textContent();
  }
  // ...30+ methods
}
```

Child pages extend it and compose business methods:

```javascript
class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.loginButton = page.getByRole("button", { name: "Login" });
  }
  async login(u, p) {
    await this.fill(this.usernameInput, u);
    await this.fill(this.passwordInput, p);
    await this.click(this.loginButton); // uses BasePage method
  }
}
```

Inheritance chain:

```
BasePage
   ▲
   ├── LoginPage
   ├── InventoryPage
   ├── CartPage
   ├── CheckoutPage
   └── CheckoutCompletePage
```

---

Q10: What locator strategy do you use? (Very common real-time question)

Answer:
I deliberately use a mix of locator strategies, exactly like real projects, and it's also a teaching feature:

| Strategy | Example                                                               | When                    |
| -------- | --------------------------------------------------------------------- | ----------------------- |
| Built-in | `getByRole('button', {name:'Login'})`, `getByPlaceholder('Username')` | User-facing, resilient  |
| CSS      | `#password`, `[data-test="error"]`                                    | Stable IDs / attributes |
| XPath    | `//button[@data-test='cancel']`, `//div[@class='login_logo']`         | When CSS is awkward     |

Example from `LoginPage.js`:

```javascript
this.usernameInput = page.getByPlaceholder("Username"); // built-in
this.passwordInput = page.locator("#password"); // CSS
this.loginButton = page.getByRole("button", { name: "Login" }); // built-in role
this.errorButton = page.locator("//button[@class='error-button']"); // XPath
```

Why prefer built-in? They mirror how users and assistive tech find elements, so they're more resilient to markup changes.

---

Q11: How do you build locators for dynamic products (add-to-cart per item)?

Answer:
SauceDemo uses `data-test="add-to-cart-<slug>"`. I build the id from the product name using my `slugify` utility:

```javascript
addToCartButton(productName) {
  const id = slugify(productName);              // "Sauce Labs Backpack" → "sauce-labs-backpack"
  return this.page.locator(`[data-test="add-to-cart-${id}"]`);
}
```

This keeps the tests readable — they pass a human name, the page object handles the mapping.

---

Q12: How do you handle dynamic elements and waits in POM?

Answer:

1. Playwright auto-wait — click/fill wait for actionability automatically.
2. BasePage `waitFor` — explicit visibility waits when needed.
3. `waitForUrl` / `waitForLoadState` — for navigation and network settling.
4. `utils/waitUtils.js` — `retry`, `waitUntil`, `sleep` for eventual-consistency cases (no hard sleeps by default).

```javascript
await this.waitFor(this.errorMessage); // BasePage
await page.waitForURL(/inventory/); // navigation
await retry(() => addProduct("Backpack"), { retries: 3 }); // waitUtils
```

---

3. Playwright Fixture Questions

---

Q13: What are Playwright fixtures? How do they work?

Answer:
Fixtures are Playwright's built-in dependency injection. They create objects and inject them into tests.

```javascript
const test = base.extend({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page)); // inject
  },
});

test("login", async ({ loginPage }) => {
  await loginPage.login("standard_user", "secret_sauce");
});
```

The `{ page }` inside my fixture is itself a built-in Playwright fixture — my custom fixtures build on top of it.

---

Q14: What custom fixtures does your framework provide?

Answer:
From `fixtures/baseFixture.js`:

| Fixture                                                                          | Purpose                                   |
| -------------------------------------------------------------------------------- | ----------------------------------------- |
| `loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`, `checkoutCompletePage` | Page objects, auto-injected               |
| `loggedInPage`                                                                   | A page already logged in as standard user |
| `data`                                                                           | The random data generator                 |

---

Q15: Explain your auto-login fixture. Why is it useful?

Answer:
`loggedInPage` logs in once and lands on the inventory page, so tests that need an authenticated session don't repeat login steps:

```javascript
loggedInPage: async ({ page }, use) => {
  const loginPage = new LoginPage(page);
  await loginPage.open();
  await loginPage.login(env.users.standard, env.password);
  await page.waitForURL(/inventory/);
  await use(page);
},
```

Usage:

```javascript
test("inventory has 6 products", async ({ loggedInPage, inventoryPage }) => {
  expect(await inventoryPage.getProductCount()).toBe(6);
});
```

> Note: I intentionally did NOT use storage-state based auth here to keep the login flow explicit and teachable, but that's the natural next optimization.

---

Q16: Can a fixture have setup and teardown?

Answer:
Yes — code before `use()` is setup, after is teardown. My `api` fixture is a perfect example: it creates the client (setup) and disposes it (teardown). Playwright also cleans up the `page`/`context` automatically per test for isolation.

---

Q17: How do you attach a screenshot on failure globally?

Answer:
I added a global `afterEach` inside `baseFixture.js` so every spec importing my fixtures gets it:

```javascript
test.afterEach(async ({ page }, testInfo) => {
  if (testInfo.status !== testInfo.expectedStatus) {
    const shot = await page.screenshot({ fullPage: true });
    await testInfo.attach("failure-screenshot", {
      body: shot,
      contentType: "image/png",
    });
  }
});
```

Plus Playwright retains trace, video, and screenshot on failure via config.

---

4. Configuration & Environment Questions

---

Q18: Explain your playwright.config.js.

Answer:
It's the central config. It imports a resolved `env` object and wires everything:

```javascript
import env from './config/env.config.js';

export default defineConfig({
  testDir: './tests',
  globalSetup: './global-setup.js',
  timeout: env.timeouts.test,
  expect: { timeout: env.timeouts.expect },
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', ...], ['json', ...], ['junit', ...], ['allure-playwright', ...]],
  use: {
    baseURL: env.baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    headless: env.headless,
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,
  },
  projects: [chromium, firefox, webkit],
});
```

---

Q19: How do you manage multiple environments? (Key real-time question)

Answer:
I use `config/env.config.js` + per-environment JSON files:

```
config/environments/
├── dev.json
├── qa.json      (default)
└── staging.json
```

`env.config.js` resolves the active environment with a clear precedence:

```javascript
const ENV_NAME = process.env.ENV || 'qa';           // 1. which env
const fileConfig = loadEnvFile();                    // 2. load <ENV>.json
// 3. merge:  ENV file  ->  .env variable  ->  default
baseURL: process.env.BASE_URL || fileConfig.baseURL || 'https://www.saucedemo.com',
```

Switch environments:

```bash
npm run test:staging          # cross-env ENV=staging
$env:ENV="staging"; npx playwright test   # PowerShell
```

This is cleaner than a `.env`-only approach because structured JSON scales better for many settings.

---

Q20: What is the difference between timeout, actionTimeout, navigationTimeout, and expect timeout?

Answer:

| Timeout             | Scope                      | Source in my framework          |
| ------------------- | -------------------------- | ------------------------------- |
| `timeout`           | Entire test                | `env.timeouts.test` (60s)       |
| `actionTimeout`     | Single action (click/fill) | `env.timeouts.action` (15s)     |
| `navigationTimeout` | `goto`/`reload`            | `env.timeouts.navigation` (30s) |
| `expect.timeout`    | Assertions (auto-retry)    | `env.timeouts.expect` (10s)     |

All are centralized in `env.config.js`, so I tune them per environment.

---

Q21: How do you handle retries? Explain the retry mechanism.

Answer:
The framework has a three-level retry mechanism — I don't rely on a single blanket retry.

Level 1 — Test-level retry (Playwright built-in), in `playwright.config.js`:

```javascript
retries: process.env.CI ? 2 : 0;
```

- Locally: `0` → fail fast, catch real issues while developing.
- CI: `2` → up to 3 total attempts to absorb environmental flakiness.
- On each retry Playwright creates a fresh browser context + fresh page + fresh page objects (fixtures re-run), so no stale state leaks between attempts.
- A test that fails then passes is marked flaky in the HTML/Allure report — instability stays visible instead of being hidden.

Level 2 — Action-level retry (custom helper), in `utils/waitUtils.js`:
For a single unreliable step (network blip, animation, eventual consistency) I retry just that step instead of the whole test:

```javascript
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
      if (attempt < retries) await sleep(delay);
    }
  }
  throw lastError; // give up only after all attempts
}
```

```javascript
await retry(() => inventoryPage.addToCart("Sauce Labs Backpack"), {
  retries: 3,
  delay: 1000,
  name: "add backpack",
});
```

It logs every failed attempt via Winston and throws the last error only if all attempts fail.

Level 3 — Assertion auto-retry (Playwright `expect`):
Web-first assertions like `expect(locator).toBeVisible()` auto-retry internally until `expect.timeout` (10s from `env.timeouts.expect`), so I don't hand-write polling for UI conditions.

Summary:

| Level         | Mechanism             | Where                  | Purpose                               |
| ------------- | --------------------- | ---------------------- | ------------------------------------- |
| Whole test    | `retries: CI ? 2 : 0` | `playwright.config.js` | Absorb CI flakiness + flaky detection |
| Single action | custom `retry()`      | `utils/waitUtils.js`   | Retry one flaky step with logging     |
| Assertion     | `expect` auto-retry   | built-in               | Wait for a UI condition               |

I also poll conditions with `waitUntil()` from `waitUtils.js` instead of hard `sleep()` calls, keeping the suite stable without arbitrary waits.

---

5. Reporting Questions

---

Q22: What reporters do you use? Why multiple?

Answer:
Five reporters:

| Reporter | Purpose                            | Audience               |
| -------- | ---------------------------------- | ---------------------- |
| HTML     | Playwright visual report           | QA quick review        |
| JSON     | Machine-readable results           | Dashboards/CI parsing  |
| JUnit    | XML results                        | CI test summaries      |
| Allure   | Rich interactive report + env info | Stakeholders/debugging |

---

Q23: How do you show environment info in Allure?

Answer:
Via `global-setup.js`, which runs once and writes `environment.properties` into `reports/allure-results/`:

```javascript
const props = {
  Environment: env.name,
  "Base.URL": env.baseURL,
  Browser: process.env.BROWSER || "chromium",
  "Node.Version": process.version,
  OS: `${os.type()} ${os.release()}`,
};
fs.writeFileSync(
  path.join(dir, "environment.properties"),
  Object.entries(props)
    .map(([k, v]) => `${k}=${v}`)
    .join("\n"),
);
```

Allure then displays this on the report's overview page.

---

Q24: How do you generate and view the Allure report?

Answer:

```bash
npm test                  # produces reports/allure-results/
npm run allure:generate   # allure generate --clean -o reports/allure-report
npm run allure:open       # open the generated report
# or one-shot:
npm run allure:serve
```

---

Q25: What evidence is captured on failure?

Answer:

- Screenshot — full-page, attached via the global `afterEach`.
- Trace — retained on failure (open with `npx playwright show-trace`).
- Video — retained on failure.
- Winston logs — `logs/test-execution.log` and `logs/error.log`.

This gives rich debugging context without re-running the test.

---

Q25a: How do you debug with the Playwright Trace Viewer? Which library did you use?

Answer:
The Trace Viewer is built into Playwright itself — no third-party debugging library. I enabled it through the `trace` option in `playwright.config.js`:

```javascript
use: {
  trace: 'retain-on-failure',   // capture a trace.zip only when a test fails
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

Trace modes: `off` | `on` | `retain-on-failure` (what I use) | `on-first-retry` | `on-all-retries`. I use `retain-on-failure` so passing runs stay fast and only failures produce a trace.

How I open a trace:

```bash
npm run show-trace test-results/<folder>/trace.zip   # open a specific trace
npm run report                                        # HTML report → click trace icon on a failure
```

Helper scripts I added to `package.json`:

| Script       | Command                      | Use                                        |
| ------------ | ---------------------------- | ------------------------------------------ |
| `test:trace` | `playwright test --trace on` | Force-record a trace for every test        |
| `show-trace` | `playwright show-trace`      | Open a `trace.zip` in the Trace Viewer     |
| `test:debug` | `playwright test --debug`    | Step through with the Playwright Inspector |
| `test:ui`    | `playwright test --ui`       | UI mode with a live, built-in trace view   |

The Trace Viewer gives full time-travel debugging: DOM snapshots before/after each action, a timeline, network log, console log, and source — so I can diagnose a CI failure without re-running it.

---

6. CI/CD Questions

---

Q26: How is your framework integrated with CI/CD?

Answer:
Two pipelines:

1. GitHub Actions (`.github/workflows/playwright.yml`) — matrix across chromium/firefox/webkit, installs deps + browsers, runs tests, uploads artifacts, publishes a merged Allure report.
2. Jenkins (`Jenkinsfile`) — declarative pipeline with `BROWSER`/`SUITE` parameters; stages: checkout → install → browsers → test → Allure; post-steps publish JUnit/Allure/HTML.

CI-friendly config:

```javascript
forbidOnly: !!process.env.CI,       // block test.only in CI
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 2 : undefined,
```

---

Q27: What is the execution strategy across the pipeline?

Answer:

- On every PR/push: smoke tests (`npm run test:smoke`).
- On merge to main: full regression (`npm run test:regression`).
- Nightly: all tests across all browsers (`npm test`).
- Pre-release: run against staging (`ENV=staging npm test`).

---

7. Parallel & Cross-Browser Execution Questions

---

Q30: How does parallel execution work?

Answer:

```javascript
fullyParallel: true,
workers: process.env.CI ? 2 : undefined,  // auto = CPU cores locally
```

Playwright spawns worker processes; each runs a spec at a time in its own browser context. Tests in different files run in parallel; tests within a file run sequentially by default.

---

Q31: How do you avoid data conflicts in parallel runs?

Answer:

1. Unique data via `dataGenerator` — `data.customer()`, `email()` are timestamp-based and unique.
2. Isolation — each test gets a fresh browser context (no shared cookies/state).
3. No shared mutable globals across tests.

---

Q32: How do you run cross-browser tests?

Answer:
Three projects in config:

```javascript
projects: [
  { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  { name: "firefox", use: { ...devices["Desktop Firefox"] } },
  { name: "webkit", use: { ...devices["Desktop Safari"] } },
];
```

```bash
npm run test:chromium   # one browser
npm test                # all three
```

---

8. Data-Driven Testing Questions

---

Q33: How do you implement data-driven testing?

Answer:
External JSON + `for...of` loops that generate a test per data row:

```javascript
const loginData = readJSON("loginData.json");

for (const data of loginData.invalidCredentials) {
  test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
    await loginPage.login(data.username, data.password);
    expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
  });
}
```

Each object in the array becomes its own test with a unique title.

---

Q34: How do you read test data in ES Modules?

Answer:
Through `utils/dataReader.js`, which resolves paths using ESM-safe `__dirname`:

```javascript
import { readJSON } from "../../utils/dataReader.js";
const checkoutData = readJSON("checkoutData.json");
```

I avoid `import data from './x.json'` assertions for portability and use a small reader utility instead.

---

Q35: How do you generate unique/random test data?

Answer:
Using `utils/dataGenerator.js` (a dependency-free Faker-style helper):

```javascript
const cust = data.customer();
// { firstName, lastName, email, postalCode, phone } — unique per run
await checkoutPage.fillCustomerInfo(
  cust.firstName,
  cust.lastName,
  cust.postalCode,
);
```

Other helpers: `email()`, `firstName()`, `postalCode()`, `randomString()`, `randomInt()`.

---

Q36: What's the advantage of external test data?

Answer:

| Hardcoded data             | External data             |
| -------------------------- | ------------------------- |
| Change requires code edits | Edit JSON only            |
| One dataset per test       | Many datasets, same logic |
| Needs code review for data | No code review for data   |
| Non-tech folks can't edit  | BAs can edit JSON         |

---

9. Unit Testing Questions

---

Q40: You wrote unit tests too? Why unit tests in a UI framework?

Answer:
Yes — `tests/unit/` tests the utility layer (stringUtils, dataGenerator, dateUtils, waitUtils) without a browser:

```javascript
test("slugify converts product name @unit", () => {
  expect(slugify("Sauce Labs Backpack")).toBe("sauce-labs-backpack");
});
```

The utilities are used everywhere (e.g., `slugify` builds locators). Unit tests give a fast safety net so a broken helper doesn't silently break many UI tests. Run with `npm run test:unit`.

---

Q41: What are soft assertions and where do you use them?

Answer:
`expect.soft()` records a failure but lets the test continue, so one run reports all problems instead of stopping at the first. I use them in the long checkout flow:

```javascript
expect.soft(await checkoutCompletePage.isOrderComplete()).toBeTruthy();
expect
  .soft(await checkoutCompletePage.getHeaderText())
  .toBe(MESSAGES.ORDER_COMPLETE_HEADER);
```

Great for verifying multiple independent outcomes on a confirmation page.

---

Q42: What is test.step() and why use it?

Answer:
`test.step()` groups actions into named, reportable steps. It makes the Allure/HTML report readable and pinpoints exactly where a failure happened.

```javascript
await test.step("Fill customer information and continue", async () => {
  await checkoutPage.fillCustomerInfo(first, last, zip);
  await checkoutPage.continue();
});
```

I also wrap key page-object actions (like `login`) in a step.

---

Q43: How do you handle logging?

Answer:
Winston (`utils/logger.js`) with console + two files:

- `logs/test-execution.log` (all levels)
- `logs/error.log` (errors only)

```javascript
import logger from "../utils/logger.js";
logger.info("Attempting login with username: standard_user");
```

BasePage methods log each interaction, giving a readable action trail.

---

10. Real-Time Scenario-Based Questions

---

Q44: A test passes locally but fails in CI. How do you debug?

Answer:

1. Open the Allure report — check the attached screenshot, trace, video, and logs.
2. Verify the environment — is `ENV` the same? Is `baseURL` correct?
3. Consider speed — CI is slower; timeouts are centralized in `env.config.js` so I can bump them per env.
4. Open the trace (`npx playwright show-trace`) from CI artifacts.
5. Run locally with `--workers=1` to rule out a parallel conflict.
6. Try headed vs headless if rendering differs.

---

Q45: How do you handle flaky tests?

Answer:

1. CI retries (`retries: 2`) with flaky marking in Allure.
2. Auto-wait + explicit `waitFor`/`waitForURL` instead of hard sleeps.
3. `waitUtils.retry/waitUntil` for eventual-consistency steps.
4. Unique data via `dataGenerator` to avoid collisions.
5. Isolation — fresh context per test.

---

Q46: How do you add a new page to the framework?

Answer:
Step 1 — Page class:

```javascript
// pages/WishlistPage.js
import BasePage from "./BasePage.js";
class WishlistPage extends BasePage {
  constructor(page) {
    super(page);
    this.items = page.locator(".wishlist_item");
  }
  async getCount() {
    return this.count(this.items);
  }
}
export default WishlistPage;
```

Step 2 — Fixture:

```javascript
import WishlistPage from '../pages/WishlistPage.js';
wishlistPage: async ({ page }, use) => { await use(new WishlistPage(page)); },
```

Step 3 — Test:

```javascript
import { test, expect } from "../../fixtures/baseFixture.js";
test("wishlist count @regression", async ({ wishlistPage }) => {
  expect(await wishlistPage.getCount()).toBeGreaterThan(0);
});
```

---

Q47: How do you handle dropdowns (e.g., product sorting)?

Answer:
SauceDemo's sort is a native `<select>`. BasePage exposes `selectByValue`:

```javascript
// InventoryPage
async sortBy(value) { await this.selectByValue(this.sortDropdown, value); }
// usage: await inventoryPage.sortBy(SORT_OPTIONS.PRICE_LOW_TO_HIGH);
```

I keep the option values in `utils/constants.js` to avoid magic strings.

---

Q48: How do you verify price calculations (subtotal + tax = total)?

Answer:
I read the displayed strings, parse them with `stringUtils.parsePrice`, and assert:

```javascript
const subtotal = await checkoutPage.getSubtotal();
const tax = await checkoutPage.getTax();
const total = await checkoutPage.getTotal();
expect(Number((subtotal + tax).toFixed(2))).toBe(total);
```

`parsePrice('$29.99')` → `29.99`, keeping the math clean.

---

Q49: How do you handle test tagging and selective execution?

Answer:
Tags go in test titles: `@smoke`, `@regression`, `@unit`.

```bash
npm run test:smoke                        # --grep @smoke
npx playwright test --grep "@smoke|@regression"  # multiple
npx playwright test --grep-invert @smoke  # exclude
```

---

Q50: Why did you split the login spec into multiple files?

Answer:
Originally all login scenarios were in one `login.spec.js`. I split them by concern:

- `positiveLogin.spec.js` — valid users
- `negativeLogin.spec.js` — invalid/empty/locked (data-driven)
- `logout.spec.js` — logout flow

This improves readability, makes selective runs easier, and mirrors how real suites grow. `npm run test:login` still runs the whole folder.

---

Q51: How do you handle the environment/proxy blocking the site?

Answer:
On the corporate network, a proxy injects a self-signed cert and blocks the target site, so tests hang. I handle this by:

- `ignoreHTTPSErrors: true` in config.
- Running tests off the restricted network (personal laptop / CI runner).
- Keeping the project out of OneDrive to avoid EPERM file locks during Playwright's `test-results` cleanup.

This is an environment issue, not a code issue — the framework itself is validated error-free.

---

Q53: What challenges did you face building this framework?

Answer:

| Challenge                        | Solution                                       |
| -------------------------------- | ---------------------------------------------- |
| OneDrive file locks (EPERM)      | Moved project out of OneDrive for runs         |
| Corporate proxy self-signed cert | `ignoreHTTPSErrors`, run off-network / CI      |
| ESM has no `__dirname`           | Recreated via `fileURLToPath(import.meta.url)` |
| Allure v3 config keys            | Used `resultsDir` correctly                    |
| Flaky timing                     | Auto-wait + waitUtils + CI retries             |
| Locator brittleness              | Mixed strategy, prefer built-in locators       |
| Keeping tests DRY                | BasePage + fixtures + auto-login               |

---

Q54: How would you scale this framework for a larger application?

Answer:

1. Add storage-state authentication to skip UI login (the one optimization I deliberately left out for teaching).
2. Shard tests across CI machines (`--shard`).
3. API pre-conditions to set up state faster than UI.
4. More page objects and a components layer for shared widgets.
5. Test data service (API/DB) instead of static JSON where needed.
6. Historical trend dashboard from Allure history.

---

Q55: Give me the 2-minute summary of your framework.

Answer:

> "I built a Data-Driven framework using Playwright + JavaScript ES Modules + POM for SauceDemo. It has a BasePage with 30+ reusable logged methods, five page objects using a mix of built-in/CSS/XPath locators, and custom fixtures for DI including auto-login and a data generator. Configuration is multi-environment (dev/qa/staging JSON via `env.config.js`), with a global setup writing Allure environment info. Tests are data-driven via external JSON, use test.step() and soft assertions, and are tagged for selective runs. I added a unit test suite, five reporters (list/HTML/JSON/JUnit/Allure) with trace/video/screenshots on failure, and Jenkins + GitHub Actions for CI/CD. It runs cross-browser in parallel."

---

11. Basic / Frequently-Asked Questions

> These are the short, fundamental questions interviewers use as warm-ups. Keep answers crisp.

---

Q56: What is Playwright?

Answer:
Playwright is an open-source end-to-end test automation framework by Microsoft. It drives Chromium, Firefox, and WebKit with a single API, has auto-waiting, and supports JavaScript/TypeScript, Python, Java, and .NET.

---

Q57: What is the difference between `test` and `test.only` / `test.skip`?

Answer:

- `test()` — a normal test.
- `test.only()` — runs _only_ that test (handy for debugging; blocked on CI via `forbidOnly`).
- `test.skip()` — skips the test.
- `test.fixme()` — marks a known-broken test to skip.

---

Q58: What is the difference between `beforeEach`, `beforeAll`, `afterEach`, `afterAll`?

Answer:

| Hook         | Runs                                                   |
| ------------ | ------------------------------------------------------ |
| `beforeAll`  | Once before all tests in the file                      |
| `beforeEach` | Before every test                                      |
| `afterEach`  | After every test (I use it for the failure screenshot) |
| `afterAll`   | Once after all tests in the file                       |

---

Q59: What is the difference between `page.locator()` and `page.$()`?

Answer:

- `page.locator()` — returns a lazy Locator; re-queried on each action, works with auto-wait and web-first assertions. Preferred.
- `page.$()` — returns an ElementHandle immediately (a snapshot); can go stale. Discouraged in modern Playwright.

---

Q60: What is the difference between `click()` and `dblclick()` / `type()` and `fill()`?

Answer:

- `click()` = single click; `dblclick()` = double click.
- `fill()` sets a value in one step (clears + sets) — fast, preferred.
- `type()` / `pressSequentially()` types character-by-character — use only when the field reacts to each keystroke.

---

Q61: How do you take a screenshot in Playwright?

Answer:

```javascript
await page.screenshot({ path: "shot.png", fullPage: true }); // whole page
await element.screenshot({ path: "element.png" }); // one element
```

In my framework, failure screenshots are attached automatically via the global `afterEach`.

---

Q62: How do you handle assertions in Playwright?

Answer:
Using `expect`. Web-first assertions auto-retry:

```javascript
await expect(page.locator(".title")).toHaveText("Products");
await expect(page.locator("#btn")).toBeVisible();
expect(2 + 2).toBe(4); // non-retrying value assertion
```

---

Q63: What is auto-waiting in Playwright?

Answer:
Before an action (click/fill), Playwright automatically waits for the element to be attached, visible, stable, and enabled — so I rarely need explicit waits. This is the main reason Playwright tests are less flaky than Selenium.

---

Q64: What is `let`, `const`, and `var` in JavaScript?

Answer:

- `var` — function-scoped, hoisted, avoid it.
- `let` — block-scoped, reassignable.
- `const` — block-scoped, cannot be reassigned (but object contents can still change).

I use `const` by default and `let` only when reassignment is needed.

---

Q65: What is the difference between `==` and `===`?

Answer:

- `==` compares with type coercion (`0 == '0'` is `true`).
- `===` is strict — compares value _and_ type (`0 === '0'` is `false`).

Always use `===`.

---

Q66: What is a Promise / async-await?

Answer:
A Promise represents a future value (pending → fulfilled/rejected). `async/await` is syntactic sugar to write asynchronous code that reads like synchronous code. Almost every Playwright call returns a Promise, so I `await` them.

```javascript
async function login() {
  await loginPage.open();
  await loginPage.login(user, pass);
}
```

---

Q67: What is the difference between synchronous and asynchronous code?

Answer:

- Synchronous — runs line by line, each blocking the next.
- Asynchronous — starts an operation and continues without blocking; the result arrives later via a Promise/callback. Browser automation is inherently async, so Playwright is Promise-based.

---

Q68: What is the difference between `map()`, `forEach()`, and `filter()`?

Answer:

- `forEach()` — loops, returns nothing (side effects).
- `map()` — returns a new array of transformed values.
- `filter()` — returns a new array of items that pass a condition.

```javascript
const names = products.map((p) => p.name);
const cheap = products.filter((p) => p.price < 20);
```

---

Q69: What is a headless vs headed browser?

Answer:

- Headless — no visible UI, faster, used in CI (my default).
- Headed — shows the browser window; useful for debugging (`npm run test:headed`).

---

Q70: How do you run a single test or a single file?

Answer:

```bash
npx playwright test tests/login/positiveLogin.spec.js   # one file
npx playwright test -g "valid standard user"            # by title
npx playwright test tests/login/positiveLogin.spec.js:12 # by line number
```

---

Q71: What is the difference between a framework and a library?

Answer:

- A library is code _you_ call (e.g., a date utility).
- A framework _calls your code_ and defines the structure/flow (e.g., Playwright Test runs your test functions). Inversion of control is the key difference.

---

Q72: What is npm and package.json?

Answer:

- npm — Node's package manager to install and run dependencies.
- package.json — the project manifest: metadata, dependencies, and `scripts` (like `npm test`). `package-lock.json` pins exact versions for reproducible installs.

---

Q73: What are the different types of testing you know?

Answer:
Unit, integration, functional/E2E, regression, smoke, sanity, API, performance, accessibility, and visual testing. My framework covers E2E, API, and unit testing in one place.

---

Q74: What is the difference between smoke and regression testing?

Answer:

- Smoke — a quick check that core critical paths work (run on every build; `@smoke` tag).
- Regression — a broad check that existing features still work after changes (`@regression` tag).

---

Q75: How do you debug a failing Playwright test?

Answer:

1. `npm run test:debug` (Inspector) or `npm run test:ui` (UI mode).
2. Open the trace (`npm run show-trace`).
3. Check the failure screenshot/video/logs.
4. Add `await page.pause()` to stop and inspect interactively.
5. Run headed to watch it live.

---
