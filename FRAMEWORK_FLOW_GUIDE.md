# Framework Flow Guide

This document explains the automation framework created so far.
The framework is still in progress. It documents the current implementation only.

## 1. Application under test

config/env.config.js Environment URLs, users, and settings
The framework currently uses SauceDemo:

```text
https://www.saucedemo.com
```

The planned business flow is:

```text
Login -> Products -> Cart -> Checkout -> Order complete
```

The login and products foundation is implemented. Cart and checkout are still being
built.

## 2. Project structure

```text
package.json                         Test commands and dependencies
playwright.config.js                 Playwright test configuration
config/env.config.js                 Environment URLs, users, and settings
fixture/baseFixture.js               Creates reusable test fixtures
`config/env.config.js` reads that value and selects one object from the in-file
`environments` map:
pages/LoginPage.js                   Login page actions and locators
pages/InventoryPage.js               Product page actions and locators
const environment = process.env.ENV || 'dev';
utils/constants.js                   Routes, messages, titles, and options
tests/LoginPageTest/                 Login test scenarios
If `ENV` is not supplied, the default environment is `dev`.
utils/dateUtils.js                   Empty, planned date helpers
The available environment objects are defined in the same file:
test-data/                           Reserved for future test data
```

environments.dev
environments.qa
environments.staging

## 3. Step 1: Install and start the framework

Each environment object contains:

Dependencies are defined in `package.json`.

Available commands are:

````bash
npm run test:dev
npm run test:qa
npm run test:staging
env.config.js selects environments.dev

4. `config/env.config.js` to see the environment URLs and users.

```bash
npm run test:dev
````

starts the Playwright test runner with the `dev` environment.

## 4. Step 2: Select an environment

Each npm command sets the `ENV` variable:

```text
npm run test:dev     -> ENV=dev
npm run test:qa      -> ENV=qa
npm run test:staging -> ENV=staging
```

`config/env.config.js` reads that value and selects one object from the in-file
`environments` map:

```javascript
const environment = process.env.ENV || "dev";
```

If `ENV` is not supplied, the default environment is `dev`.

The available environment objects are defined in the same file:

```text
environments.dev
environments.qa
environments.staging
```

Each environment object contains:

- Environment name
- Base URL
- Password
- Standard user
- Locked-out user
- Problem user
- Performance user
- Error user

The final configuration object also contains test, action, navigation, and expectation
timeouts.

## 5. Step 3: Load Playwright configuration

`playwright.config.js` imports the environment object:

```javascript
import env from "./config/env.config.js";
```

The configuration currently defines:

- Test directory: `tests/`
- Chromium browser
- HTML reporter
- Headed execution with `headless: false`
- Base URL from `env.baseURL`
- Action timeout from `env.timeouts.action`
- Parallel test support
- Trace collection on the first retry

This is where Playwright learns which tests to find, which browser to use, and which
shared settings apply to every test.

## 6. Step 4: Playwright creates the browser page

For every test, Playwright provides a `page` object.

The `page` object represents one browser tab. It is used to:

- Navigate to a URL
- Find page elements
- Click buttons
- Fill input fields
- Read text and attributes
- Perform assertions

## 7. Step 5: Create reusable browser actions with BasePage

`pages/BasePage.js` is the parent class for the page objects.

Its constructor stores the Playwright page:

```javascript
constructor(page) {
    this.page = page;
}
```

The class contains common actions such as:

```text
goto, reload, goBack, goForward
click, forceClick, doubleClick, rightClick
fill, type, clear, pressKey, hover
dragAndDrop, check, uncheck
getText, getAllTexts, getValue, getAttribute
isVisible, isEnabled, isDisabled, count
selectByValue, selectByLabel, selectByIndex
waitFor, waitForLoadState, waitForUrl
uploadFile, acceptDialog, dismissDialog
frame, openNewTab, scrollIntoView, jsClick
getPageTitle, getUrl, takeScreenshot
```

Instead of duplicating these actions in every page object, child pages inherit them.

### How `_resolve()` works

`BasePage` accepts either a selector string or a Playwright Locator:

```javascript
await this.click("#login-button");
await this.click(this.loginButton);
```

The `_resolve()` method converts a string into a Locator. If a Locator is already
provided, it returns that Locator.

## 8. Step 6: Create the LoginPage object

`pages/LoginPage.js` represents the login screen.

It extends `BasePage`:

```javascript
class LoginPage extends BasePage
```

Its constructor calls:

```javascript
super(page);
```

This gives `LoginPage` all the shared methods from `BasePage`.

LoginPage contains locators for:

- Username input
- Password input
- Login button
- Error message
- Error close button
- Login logo

It contains these actions:

```text
open()
login(username, password)
getErrorMessage()
hasError()
dismissError()
```

The login method performs this sequence:

```text
Fill username
    -> Fill password
        -> Click Login
```

The selectors stay inside `LoginPage.js`; the test calls the readable `login()` method.

## 9. Step 7: Create the InventoryPage object

`pages/InventoryPage.js` represents the products page.

It contains locators for:

- Product cards
- Product names
- Product prices
- Product images
- Sort dropdown
- Cart badge
- Cart link
- Menu, logout, and reset controls
- Social media links

Implemented actions include:

```text
addProductToCart(productName)
removeProductFromCart(productName)
addMultipleProducts(productNames)
getProductCount()
getProductNames()
sortBy(sortValue)
getCartCount()
goToCart()
openProductDetails(productName)
logout()
resetAppState()
openSocialLink(network)
isLoaded()
```

For example:

```javascript
await inventoryPage.addProductToCart("Sauce Labs Backpack");
```

The test does not need to know the product's HTML selector.

## 10. Step 8: Start the CartPage object

`pages/CartPage.js` has been started.

Currently it contains:

- `BasePage` inheritance
- A page title locator
- An `open()` method

Cart item actions and checkout actions have not been added yet.

## 11. Step 9: Centralize constants

`utils/constants.js` stores values reused by the framework.

Implemented groups include:

```text
ROUTES
MESSAGES
SORT_OPTIONS
TITLES
EXPECTED_PRODUCT_COUNT
```

Routes include:

```text
LOGIN
INVENTORY
CART
CHECKOUT_STEP_ONE
CHECKOUT_STEP_TWO
CHECKOUT_COMPLETE
```

Using constants avoids repeating route names, messages, and titles in many files.

## 12. Step 10: Create the custom fixture

`fixture/baseFixture.js` extends Playwright's default test object.

It creates a `loginPage` fixture:

```javascript
const test = base.extend({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },
});
```

The fixture flow is:

```text
Playwright creates page
    -> Fixture receives page
        -> Fixture creates LoginPage(page)
            -> Fixture provides loginPage to the test
```

The fixture is exported together with `expect`:

```javascript
export { test, expect };
```

## 13. Step 11: Run the login test

The current test is:

```text
tests/LoginPageTest/positiveLogin.spec.js
```

It imports the custom fixture:

```javascript
import { test, expect } from "../../fixture/baseFixture.js";
```

The test receives `loginPage`:

```javascript
test('valid user can log in', async ({ loginPage }) => {
```

The complete test flow is:

```text
Start test
    -> Fixture creates LoginPage
        -> Open login page
            -> BasePage.goto('/')
                -> Browser opens base URL + '/'
        -> Fill username
            -> BasePage.fill()
        -> Fill password
            -> BasePage.fill()
        -> Click Login
            -> BasePage.click()
        -> Verify page title is Products
            -> Playwright expect assertion
```

The current test uses:

```javascript
await loginPage.open();
await loginPage.login("standard_user", "secret_sauce");
await expect(loginPage.page.locator(".title")).toHaveText("Products");
```

The test passes when the valid user reaches the Products page.

## 14. Complete framework flow in one diagram

```text
npm run test:dev
    |
    v
package.json sets ENV=dev
    |
    v
Playwright starts
    |
    v
playwright.config.js loads
    |
    v
env.config.js selects environments.dev
    |
    v
Playwright creates browser page
    |
    v
baseFixture creates loginPage
    |
    v
positiveLogin.spec.js starts scenario
    |
    v
LoginPage.open()
    |
    v
BasePage.goto('/')
    |
    v
LoginPage.login()
    |
    +--> BasePage.fill(username)
    +--> BasePage.fill(password)
    +--> BasePage.click(login button)
    |
    v
Playwright checks Products title
```

## 15. Implemented and incomplete areas

### Implemented so far

- Playwright project setup
- npm test commands
- Environment selection
- Environment configuration loading
- Playwright runner configuration
- Chromium execution
- HTML reporting configuration
- BasePage reusable actions
- LoginPage
- InventoryPage product actions
- Shared constants
- LoginPage fixture
- Positive login test

### Still in progress

- CartPage functionality
- Checkout page objects
- Checkout tests
- External test data in `test-data/`
- Custom assertions in `utils/assertioUtils.js`
- Date helpers in `utils/dateUtils.js`
- Allure/reporting helpers in `utils/allure.js`
- Centralized logging
- Additional browser projects

## 16. Student reading order

When learning this framework, read the files in this order:

1. `package.json` to understand how tests start.
2. `playwright.config.js` to understand runner settings.
3. `config/env.config.js` to understand environment loading.
4. `config/env.config.js` to see the environment URLs and users.
5. `fixture/baseFixture.js` to understand fixture creation.
6. `pages/BasePage.js` to understand shared browser actions.
7. `pages/LoginPage.js` to understand page-specific locators and actions.
8. `tests/LoginPageTest/positiveLogin.spec.js` to see the final business scenario.
9. `pages/InventoryPage.js` to understand the next application screen.
10. `utils/constants.js` to understand reusable routes and messages.

The main rule is:

```text
The test describes what to verify.
The page object describes how to use the screen.
BasePage provides common browser actions.
The fixture prepares page objects for the test.
Configuration controls the environment.
```

## 17. How `baseURL` is selected

The simplified `config/env.config.js` first selects an environment object:

```javascript
const environment = process.env.ENV || "dev";
const selectedEnvironment = environments[environment] || environments.dev;
```

For example, `npm run test:dev` sets `ENV=dev`, so `selectedEnvironment` becomes
`environments.dev`.

The final URL is then created by:

```javascript
baseURL: process.env.BASE_URL || selectedEnvironment.baseURL,
```

JavaScript checks the values from left to right and uses the first truthy value.

### 17.1 `process.env.BASE_URL`

`process.env.BASE_URL` is an optional value supplied by the terminal, a `.env` file, or
a CI pipeline.

Example:

```bash
BASE_URL=https://temporary.example.com npm run test:dev
```

Because `process.env.BASE_URL` has a value, the framework uses:

```text
https://temporary.example.com
```

This allows a temporary or CI URL to be used without editing the source code.

### 17.2 `selectedEnvironment.baseURL`

If `BASE_URL` is not provided, the framework uses the URL from the selected object:

```javascript
environments.dev.baseURL;
environments.qa.baseURL;
environments.staging.baseURL;
```

In the current framework, each environment points to:

```text
https://www.saucedemo.com
```

This keeps the environment selection simple while allowing different URLs to be added
later.

### 17.3 Evaluation examples

With a command-line override:

```text
process.env.BASE_URL          -> https://temporary.example.com
selectedEnvironment.baseURL  -> https://www.saucedemo.com
final env.baseURL             -> https://temporary.example.com
```

Without a command-line override:

```text
process.env.BASE_URL          -> undefined
selectedEnvironment.baseURL  -> https://www.saucedemo.com
final env.baseURL             -> https://www.saucedemo.com
```

### 17.4 Where the selected URL is used

`playwright.config.js` imports the final configuration object:

```javascript
import env from "./config/env.config.js";
```

It then passes the selected URL to Playwright:

```javascript
use: {
  baseURL: env.baseURL;
}
```

When a page object calls:

```javascript
await this.goto("/");
```

Playwright combines the base URL with the relative path:

```text
baseURL: https://www.saucedemo.com
path:    /
result:  https://www.saucedemo.com/
```

This is why page objects can use relative routes such as `/`, `/inventory.html`, and
`/cart.html` instead of repeating the complete website URL.
