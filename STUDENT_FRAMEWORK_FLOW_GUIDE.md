# Student Guide: Understanding and Running the Framework

This guide explains how the SauceDemo Playwright framework is organized, how its files work together, and how to run tests. The examples describe the current project code.

## 1. The Big Picture

This project uses JavaScript, Playwright Test, the Page Object Model (POM), fixtures, external test data, and reporters.

The basic idea is:

```text
Test says what behavior to check
  -> Fixture prepares the browser and page objects
  -> Page object performs actions on a screen
  -> BasePage supplies shared browser actions
  -> Playwright interacts with the website
  -> Assertions check the result
  -> Reporters and hooks record the result
```

For example, a login test should describe that a user logs in and sees the Products page. `LoginPage` knows how to enter the username and password. The test should not need to repeat the username field's selector or the button's selector.

## 2. Important Folders and Files

| Location                  | What it is for                                                                                                          |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `package.json`            | Project scripts and installed packages. Run scripts with `npm run <script>` or `npm test`.                              |
| `playwright.config.js`    | Playwright's test settings: test folder, browser projects, parallel execution, artifacts, and reporters.                |
| `global-setup.js`         | Runs once before the test run. Prepares Allure metadata files.                                                          |
| `config/env.config.js`    | Selects `dev`, `qa`, or `staging`, reads that environment's JSON file, and resolves URL, users, password, and timeouts. |
| `config/environments/`    | Environment-specific JSON settings, such as `qa.json`.                                                                  |
| `fixtures/baseFixture.js` | Extends Playwright's `test` with this framework's page objects and a failure screenshot hook.                           |
| `pages/`                  | Page Object Model classes: locators and actions for Login, Inventory, Cart, and Checkout screens.                       |
| `pages/BasePage.js`       | Common page actions reused by page classes, including click, fill, navigation, and text-reading helpers.                |
| `tests/`                  | Test specifications grouped by feature, such as login, inventory, cart, checkout, end-to-end, and utility unit tests.   |
| `test-data/`              | JSON files containing reusable users, products, and checkout data.                                                      |
| `utils/`                  | Shared helpers, including logging, constants, data reading, data generation, and Allure helpers.                        |
| `reports/`                | Generated HTML and Allure results/reports, plus failure screenshots.                                                    |
| `logs/`                   | Winston log files created during runs.                                                                                  |
| `test-results/`           | Playwright run output, including configured traces, screenshots, and videos for failures.                               |

### How the Main Pieces Work

#### Playwright configuration

`playwright.config.js` points Playwright at `tests/` and defines three browser projects: Chromium, Firefox, and WebKit. Running the full suite without a project filter schedules tests for all configured projects. The config enables parallel test execution; on CI it uses one worker and allows two retries. Outside CI, the worker count is selected by Playwright and retries are disabled.

The shared browser settings include the environment's `baseURL` and retain trace/video on failure while taking a screenshot on failure. The active top-level reporters are the console list, Playwright HTML, Allure, and the custom logger reporter.

#### Environment settings

`config/env.config.js` loads dotenv values and chooses the environment from `ENV`. If `ENV` is missing, it uses `qa`. Supported environment files are `dev.json`, `qa.json`, and `staging.json`. Environment variables can override values from the JSON configuration; defaults are also provided in the config module.

The test can import this resolved object, for example:

```js
import env from "../../config/env.config.js";

await loginPage.login(env.users.standard, env.password);
```

#### Fixtures and dependency injection

`fixtures/baseFixture.js` imports Playwright's `test`, extends it, and exports the extended `test` and `expect`. It defines fixtures such as `loginPage`, `inventoryPage`, `cartPage`, and `checkoutPage`.

When a test requests a fixture in its argument list, Playwright prepares it and passes it to that test:

```js
test("example", async ({ loginPage, inventoryPage }) => {
  // Playwright has supplied these page objects for this test.
});
```

The fixture creates each object with Playwright's `page`. Each test gets an isolated browser context/page through Playwright's built-in fixtures. The custom `loggedInPage` fixture is available for tests that want the fixture to log in before the test body runs. Tests can also log in themselves when the login journey is what they need to verify.

The custom `afterEach` hook checks whether the test failed. If so, it saves a full-page screenshot under `reports/failed-screenshots/` and attaches the screenshot to the test result.

#### Page objects and BasePage

Each class in `pages/` represents a screen or page area. Its constructor defines that screen's locators, and its methods perform meaningful actions. For example, `LoginPage.login(username, password)` fills the two fields and clicks Login.

Page classes extend `BasePage`. `BasePage` stores the Playwright `page` and provides general actions, so page classes can reuse methods such as `fill()`, `click()`, and `getText()`. The page-object methods also use the shared logger for useful action messages.

#### Test data and utilities

Tests may import JSON data using `readJSON()` from `utils/dataReader.js`, or use environment settings from `config/env.config.js`. For example, login tests can read user scenarios from `test-data/users.json` and use the configured password. This keeps test inputs separate from test steps.

Other utilities in `utils/` provide shared behavior such as route/title constants, log output, random test data, string/date helpers, and Allure metadata helpers. A utility unit test can test a helper directly without navigating a browser.

## 3. Detailed Execution Flow

### Before the run

1. You execute an npm script from the project root.
2. The script in `package.json` starts Playwright. For `npm test`, the script first removes old report and test-result folders, then runs `playwright test`.
3. Playwright reads `playwright.config.js` and loads `config/env.config.js` for the selected environment settings.
4. Playwright runs `global-setup.js` once. It creates Allure's raw-results folder and writes environment, category, and executor metadata there.
5. Playwright discovers matching test files under `tests/`. A project filter or grep filter can reduce which tests are selected.

### For each test

6. Playwright starts the selected browser project and creates a fresh page/context for the test.
7. Playwright reads the test's requested fixtures. `baseFixture.js` creates the page objects using that test's `page`.
8. Any test hooks, such as `beforeEach`, run. A hook might open the login page before each test in that file.
9. The test calls page-object methods. A page object uses its locators and inherited `BasePage` helpers to perform browser actions.
10. The test uses Playwright `expect` assertions to compare the actual page state with the expected result.
11. The custom `afterEach` hook captures and attaches a screenshot if the test failed. Playwright also saves the trace, screenshot, or video according to the configured settings.

### After the tests

12. The console and configured reporters record the results. HTML output goes to `reports/html-report`; Allure raw results go to `reports/allure-results`; the custom reporter writes test status to the Winston logs.
13. To create and open an Allure report, run `npm run allure:generate`, then `npm run allure:open`.

## 4. Example: One End-to-End Test

The file `tests/E2E/purchaseJourney.spec.js` is a useful example because it exercises the whole shopping flow. Its structure is:

1. Import `test` and `expect` from `fixtures/baseFixture.js`.
2. Request `loginPage`, `inventoryPage`, `cartPage`, `checkoutPage`, and `checkoutCompletePage` in the test callback. The fixture supplies them.
3. Open the login screen and log in using the configured standard user.
4. Verify the Products page is displayed.
5. Add products, open the cart, and verify the selected items.
6. Enter checkout information and continue to the order overview.
7. Check that the displayed total matches subtotal plus tax.
8. Finish the order and verify the confirmation page.
9. Use `test.step()` to label meaningful sections in the test report.

The relationship between a test call and its implementation is:

```text
purchaseJourney.spec.js
  -> inventoryPage.addProductToCart(name)
  -> InventoryPage.js finds the product button
  -> BasePage.click(locator) clicks it and logs the action
  -> Playwright performs the browser interaction
  -> expect(...) checks the cart or page state
```

This separation makes a test easier to read and makes selector changes easier to maintain: update the page object instead of duplicating a selector in many tests.

## 5. How to Set Up and Run Tests

Run these from the project root, where `package.json` is located.

### First-time setup

```bash
npm install
npx playwright install
```

The first command installs the packages declared by the project. The second installs Playwright browser binaries.

### Common test commands

```bash
npm test                                  # Clean previous outputs, then run the full suite
npm run test:chromium                     # Run tests in Chromium
npm run test:firefox                      # Run tests in Firefox
npm run test:webkit                       # Run tests in WebKit
npm run test:smoke                        # Run tests tagged @smoke
npm run test:regression                   # Run tests tagged @regression
npx playwright test tests/LoginPageTest   # Run the login test folder
npm run test:unit                         # Run utility unit tests
npm run test:headed                       # Run with visible browser windows
npm run test:ui                            # Open Playwright's interactive UI
```

To select an environment on macOS/Linux, set `ENV` before the command:

```bash
ENV=qa npx playwright test
ENV=staging npx playwright test --project=chromium
```

The environment config defaults to QA when `ENV` is not provided.

### View results

```bash
npm run report                 # Open the Playwright HTML report
npm run allure:generate        # Generate the Allure HTML report
npm run allure:open            # Open the generated Allure report
```

The Playwright HTML report and Allure report are separate reports. Generate the Allure HTML report after a test run before opening it.

## 6. How to Add a Test

For a new browser test, use this order:

1. Choose the correct feature folder under `tests/`, or create a suitable spec file there.
2. Import `test` and `expect` from `fixtures/baseFixture.js` if the test needs the custom page-object fixtures.
3. Request only the fixtures the test uses in the callback, such as `{ loginPage, inventoryPage }`.
4. Put screen locators and screen actions in the matching class under `pages/`. Reuse `BasePage` actions where possible.
5. Keep expected behavior and assertions in the test. Use test data files or environment configuration instead of repeating shared input values.
6. Run the single spec first, then run the appropriate broader suite or browser projects.

For a unit test of a pure utility, import the utility directly and do not request browser page fixtures unless the test really needs a browser.

## 7. Where to Look When Something Fails

- **Wrong URL or account:** check `ENV`, `config/env.config.js`, and the selected file under `config/environments/`.
- **Element not found or action fails:** check the locator and method in the related class under `pages/`.
- **Unexpected test result:** check the assertion and setup in the relevant test under `tests/`.
- **Failure screenshot:** look under `reports/failed-screenshots/` and in the attached test report.
- **Run timeline or browser recording:** check the relevant Playwright output under `test-results/` when produced.
- **Action/test status logs:** check the files under `logs/`.

## 8. Notes About the Current Project

- The active top-level reporters in `playwright.config.js` are console list, HTML, Allure, and the custom logger reporter. The current config does not enable JSON or JUnit reporters, even though some other project documents mention them.
- `npm test` clears report folders before running. Browser-specific, grep, and folder scripts do not use that same cleanup command, so their output may be added to or coexist with previous results.
- `test:login` in `package.json` points to `tests/login`, while the visible folder is named `tests/LoginPageTest`. On a case-insensitive filesystem this path may still resolve, but `npx playwright test tests/LoginPageTest` matches the current folder name explicitly.
- The environment-specific npm scripts use `cross-env`; if one reports that `cross-env` cannot be found, use the macOS/Linux `ENV=qa npx playwright test` form shown above, or install/configure `cross-env` for the project.

## 9. Recommended Learning Order

1. Read one simple spec in `tests/LoginPageTest/`.
2. Follow its imported fixture in `fixtures/baseFixture.js`.
3. Follow the called methods into `pages/LoginPage.js` and then `pages/BasePage.js`.
4. See where configuration and credentials come from in `config/env.config.js` and `config/environments/`.
5. Run that one test, then inspect the console output, logs, and report.
6. After the login flow makes sense, trace `tests/E2E/purchaseJourney.spec.js` through Inventory, Cart, and Checkout.

If you remember one rule: **tests describe expected behavior, page objects perform screen actions, fixtures connect tests to browser pages, and Playwright config controls the run.**
