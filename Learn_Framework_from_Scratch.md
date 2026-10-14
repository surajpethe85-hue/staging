🎓 Learn the Framework From Scratch — A Student's Guide

> Who is this for?
> Complete beginners who have never seen this framework (and maybe never written an
> automated test). By the end you will understand what each piece is, why it
> exists, and how all the parts fit together — because we build it up one small
> step at a time, starting from a single ugly test and slowly turning it into a
> professional framework.
>
> The golden rule of this guide: we never add a file or a concept until the
> _previous_ step becomes painful without it. Every piece of the framework was born
> to solve a real problem. If you feel the pain first, the solution makes sense.

---

📑 Table of Contents

1. [Before We Start — The Mental Model](#chapter-0)
2. [Step 1 — Your First Raw Test (no framework at all)](#chapter-1)
3. [Step 2 — The Pain of Raw Tests](#chapter-2)
4. [Step 3 — Page Object Model (POM): Move locators out of tests](#chapter-3)
5. [Step 4 — BasePage: Stop repeating yourself](#chapter-4)
6. [Step 5 — Constants: Kill the magic strings](#chapter-5)
7. [Step 6 — Configuration: Stop hard-coding URLs & users](#chapter-6)
8. [Step 7 — Fixtures: Automatic setup (Dependency Injection)](#chapter-7)
9. [Step 8 — Data-Driven Testing: One test, many data rows](#chapter-8)
10. [Step 9 — Utilities: Reusable helpers (logger, data, waits)](#chapter-9)
11. [Step 10 — Reporting, Screenshots & Debugging](#chapter-10)
12. [Step 11 — Cross-Browser & Parallel Runs](#chapter-11)
13. [Step 12 — Putting It All Together (the full flow)](#chapter-12)
14. [Cheat Sheet — What lives where & why](#cheat-sheet)

---

<a id="chapter-0"></a>
Before We Start — The Mental Model

We are testing SauceDemo (`https://www.saucedemo.com`), a fake online shop used
for practice. A typical user journey is:

```
Login  →  See products  →  Add to cart  →  Checkout  →  Order complete
```

Our job is to make a robot do this and check it works — every time, on every
browser, automatically.

We use Playwright (a browser-automation tool by Microsoft) with JavaScript.

Think of the framework as a kitchen:

| Kitchen thing       | Framework thing         | Job                                              |
| ------------------- | ----------------------- | ------------------------------------------------ |
| Recipe cards        | `tests/`                | The actual scenarios we verify                   |
| Appliances (mixer…) | `pages/` (Page Objects) | Know _how_ to operate each screen                |
| Master appliance    | `BasePage`              | Shared buttons every appliance has (on/off/etc.) |
| Pantry labels       | `utils/constants.js`    | Fixed names/URLs so nobody guesses               |
| Fridge settings     | `config/`               | Which environment/URL/users to use               |
| Prep assistant      | `fixtures/`             | Sets the table before you cook, cleans up after  |
| Grocery list        | `test-data/`            | The data your recipes consume                    |
| Helper gadgets      | `utils/`                | Small reusable tools (timer, notepad…)           |

Keep this table in mind. Every step below fills in one row.

---

<a id="chapter-1"></a>
Step 1 — Your First Raw Test (no framework at all)

🎯 Goal: Prove we can automate _anything_ before we make it pretty.

> 📦 Install first (one-time project setup):
>
> ```powershell
> npm init -y                              # create package.json (if you don't have one)
> npm install -D @playwright/test          # the Playwright test runner
> npx playwright install                   # download the browser engines (Chromium/Firefox/WebKit)
> ```
>
> - `@playwright/test` gives us `test`, `expect`, and the `page` object.
> - `npx playwright install` downloads the actual browsers Playwright drives.
> - `-D` means "dev dependency" — a tool used for building/testing, not shipped to users.

🧠 Idea first: A test is just a script that (1) opens a page, (2) does actions,
(3) checks the result. Playwright gives us a `page` object that represents the
browser tab. We write everything inline — no structure yet.

Code (this is deliberately messy):

```javascript
// tests/login/positiveLogin.spec.js  — VERSION 1 (raw)
import { test, expect } from "@playwright/test";

test("valid user can log in", async ({ page }) => {
  await page.goto("https://www.saucedemo.com"); // 1. open
  await page.fill("#user-name", "standard_user"); // 2. type username
  await page.fill("#password", "secret_sauce"); // 3. type password
  await page.click("#login-button"); // 4. click login
  await expect(page.locator(".title")).toHaveText("Products"); // 5. verify
});
```

Run it:

```powershell
npx playwright test tests/login/positiveLogin.spec.js
```

✅ What you learned:

- `test(...)` defines one scenario.
- `page` is the browser tab, injected by Playwright automatically.
- `expect(...)` is the assertion (the "check").

> 🧩 Two JavaScript words you'll see everywhere: `async` and `await`.
> Browser actions are slow — opening a page or clicking takes real time. JavaScript
> doesn't wait around by default; it would fire the next line immediately. We don't
> want that. So:
>
> - `await` means _"pause here until this action finishes, then continue."_ Every
>   Playwright action (`goto`, `fill`, `click`, `expect`) needs `await` in front of it.
> - `async` is a label we put on a function to say _"this function contains `await`
>   inside it."_ You can only use `await` inside an `async` function.
>
> Rule of thumb for now: if a line talks to the browser, put `await` in front of it,
> and make sure the surrounding function starts with `async`.

That's a working test! But now look closely… it has problems.

---

<a id="chapter-2"></a>
Step 2 — The Pain of Raw Tests

😖 The Pain: Imagine we now write 50 login tests, 30 cart tests, 40 checkout
tests. Suddenly:

1. The selector `#user-name` is copy-pasted into 120 files. The day the
   developer renames it, you edit 120 files. 😱
2. The URL `https://www.saucedemo.com` is hard-coded everywhere. Testing on a
   staging server? Edit everything again.
3. The password `secret_sauce` sits in plain text in every file.
4. Every checkout test repeats _login → add to cart → go to checkout_ — dozens of
   duplicated lines.

🧠 The insight: Tests should read like plain English business steps, not
like low-level clicks. The "how" (selectors, waits) must live somewhere else.

That "somewhere else" is the Page Object. On to Step 3.

---

<a id="chapter-3"></a>
Step 3 — Page Object Model (POM): Move locators out of tests

🎯 Goal: Each screen gets one class that owns its locators and actions.
Tests just call meaningful methods.

🧠 Idea first: A _Page Object_ is a class named after a screen (e.g.
`LoginPage`). It stores the selectors as properties and exposes actions as methods
(`login()`, `getErrorMessage()`). Tests never see a raw selector again.

---

3.1 — What is a "class"? (a simple analogy)

Before the code, the one word you must be comfortable with is class.

Think of a class as a blueprint for a TV remote. The blueprint says: _"a remote
has these buttons (properties) and can do these things (methods)."_ From one blueprint
you can build many actual remotes.

- A class = the blueprint (`LoginPage`).
- An object (or _instance_) = one actual thing built from it
  (`new LoginPage(page)`).
- Properties = the data it holds (the locators: `usernameInput`, `loginButton`).
- Methods = the actions it can do (`open()`, `login()`).

So a _Page Object_ is just a blueprint for one screen: it knows where the buttons
are (properties) and how to operate them (methods).

---

3.2 — The Page Object, decoded line by line

```javascript
// pages/LoginPage.js  — VERSION 1 (basic)
class LoginPage {
  constructor(page) {
    this.page = page;
    // Locators live HERE, not in the test
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async open() {
    await this.page.goto("https://www.saucedemo.com");
  }

  async login(username, password) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

export default LoginPage;
```

```javascript
class LoginPage {
```

- `class` starts a blueprint named `LoginPage`. Everything inside `{ }` describes what
  this screen has and does.

```javascript
constructor(page) {
```

- `constructor` is a special method that runs once, automatically, the moment you
  write `new LoginPage(page)`. Its job is to set the object up.
- It receives `page` (the browser tab) so the object knows which tab to work with.

```javascript
this.page = page;
this.usernameInput = page.getByPlaceholder("Username");
```

- `this` means _"this particular object."_ `this.page = page` saves the tab onto
  the object so other methods can use it later.
- `this.usernameInput = ...` stores a locator as a property. Now anywhere in the
  class you can say `this.usernameInput` instead of repeating the selector.

```javascript
async open() {
  await this.page.goto('https://www.saucedemo.com');
}
```

- A method — an action the page can perform. `open()` navigates the saved tab to
  the site. (`async`/`await` are the same as Step 1: browser actions must be awaited.)

```javascript
async login(username, password) {
  await this.usernameInput.fill(username);
  ...
}
```

- Another method, this time taking parameters. It uses the stored locators to fill
  the form and click — the _"how"_ now lives inside the class, not the test.

```javascript
export default LoginPage;
```

- Makes the blueprint available to other files so a test can `import LoginPage` and do
  `new LoginPage(page)`.

> 🧠 The whole file in one sentence: _`LoginPage` is a blueprint that stores this
> screen's locators (in the constructor) and exposes readable actions (`open`,
> `login`) so tests never touch raw selectors._

---

3.3 — The test becomes readable

```javascript
// tests/login/positiveLogin.spec.js  — VERSION 2 (uses POM)
import { test, expect } from "@playwright/test";
import LoginPage from "../../pages/LoginPage.js";

test("valid user can log in", async ({ page }) => {
  const loginPage = new LoginPage(page); // 👈 build one object from the blueprint
  await loginPage.open(); // 👈 call its methods — reads like English
  await loginPage.login("standard_user", "secret_sauce");
  await expect(page.locator(".title")).toHaveText("Products");
});
```

- `new LoginPage(page)` builds an actual object (this is what triggers the
  `constructor`).
- From then on the test just calls `.open()` and `.login(...)` — it reads like a
  story, and knows nothing about selectors.

💡 Why this is better:

- Selector changes now happen in one place (`LoginPage.js`).
- The test reads like a story: _open → login → check_.
- New team members understand the test without knowing the HTML.

> 🔎 Note on locators: In the real `LoginPage.js` you'll see three styles mixed
> on purpose so you learn all of them:
>
> - Built-in (best): `page.getByPlaceholder('Username')`, `getByRole('button', …)`
> - CSS: `page.locator('#password')`
> - XPath: `page.locator("//div[@class='login_logo']")`
>   Prefer built-in > CSS > XPath in real work, but you should recognize all three.

---

<a id="chapter-4"></a>
Step 4 — BasePage: Stop repeating yourself

😖 The Pain: Now we build `InventoryPage`, `CartPage`, `CheckoutPage`… and every
one of them re-writes the same low-level helpers: _wait for element, then click_;
_wait for element, then fill_; _get trimmed text_. That's the same handful of lines
copy-pasted into every page object.

🧠 The insight: Every page needs the same basic browser skills. Put those
shared skills in a parent class called `BasePage`, and let every page extend
it. This is classic Object-Oriented inheritance.

---

4.1 — What is "inheritance"? (a simple analogy)

Inheritance is one class borrowing all the abilities of another.

Think of appliances. Every appliance can _turn on_ and _turn off_. Instead of
teaching a blender, a toaster, and a microwave each how to power on separately, you
make a general "Appliance" blueprint that knows on/off, and each specific
appliance inherits those skills — then adds its own (a blender also _blends_).

In our framework:

- `BasePage` = the general "Appliance" — it knows generic browser skills (`click`,
  `fill`, `goto`, `getText`).
- `LoginPage`, `CartPage`, etc. = specific appliances — they inherit those skills
  and add their own screen-specific methods (`login()`, `addProductToCart()`).

Two keywords make this work:

- `extends` — _"this class inherits from that one."_
- `super(...)` — _"run the parent's constructor first."_

Write the shared skills once in `BasePage`; every page gets them for free.

---

4.2 — The parent class (keep it simple for now)

```javascript
// pages/BasePage.js  — VERSION 1 (just shared waits, no logging yet)
class BasePage {
  constructor(page) {
    this.page = page;
  }

  async goto(path = "/") {
    await this.page.goto(path);
  }

  // Safe click: wait until visible, THEN click
  async click(locator) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    await element.click();
  }

  // Safe fill: wait until visible, THEN type
  async fill(locator, text) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    await element.fill(text);
  }

  async getText(locator) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    return (await element.innerText()).trim();
  }
}

export default BasePage;
```

> 🧩 New syntax in this file — read this before moving on:
>
> - `async` / `await` — same as Step 1: these methods talk to the browser, so each
>   action is `await`ed and each method is marked `async`.
> - `goto(path = '/')` — the `= '/'` is a default parameter. It means _"if the
>   caller doesn't pass a path, use `'/'` (the home page) automatically."_ So
>   `goto()` opens `/`, while `goto('/cart.html')` opens the cart. It saves us from
>   writing the common case every time.
> - `_resolve(locator)` / `_describe(locator)` — small private helpers (the leading
>   `_` is just a naming convention for "internal, don't call from outside"). They let
>   you pass either a selector string or a Playwright locator. You don't need
>   to understand their internals yet — just know they make the methods flexible.

Why each helper does the "wait, THEN act" dance: pages load bit by bit. If you
click a button that hasn't appeared yet, the test fails randomly (this is called
_flakiness_). Every `BasePage` method first does `waitFor({ state: 'visible' })`, so
the action only happens once the element is truly ready. You write this safety once
here, and every page inherits it.

> ⏳ Coming later: notice there's no logging here yet — that's intentional. We
> haven't built a logger yet. In Step 9 we'll add one line (`logger.info(...)`)
> to each of these methods, so every click and fill automatically records what it
> did. For now, focus only on the idea of shared methods via inheritance.

---

4.3 — The child class inherits everything, decoded

Now child pages become tiny — they just declare locators & business methods, and get
`goto/click/fill/getText` for free:

```javascript
// pages/LoginPage.js  — VERSION 3 (extends BasePage)
import BasePage from "./BasePage.js";

class LoginPage extends BasePage {
  // 👈 inherits goto/click/fill/getText…
  constructor(page) {
    super(page); // 👈 pass page up to the parent
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.locator("#password");
    this.loginButton = page.getByRole("button", { name: "Login" });
  }

  async open() {
    await this.goto("/"); // 👈 reused from BasePage
  }

  async login(username, password) {
    await this.fill(this.usernameInput, username); // 👈 reused, with wait built in
    await this.fill(this.passwordInput, password);
    await this.click(this.loginButton);
  }
}

export default LoginPage;
```

The two new keywords, explained:

```javascript
class LoginPage extends BasePage {
```

- `extends BasePage` = _"`LoginPage` is a `BasePage` and inherits all its
  methods."_ That's why `LoginPage` can call `this.goto`, `this.click`, `this.fill`
  even though they're not defined here — they come from the parent.

```javascript
constructor(page) {
  super(page);
```

- `super(page)` = _"run the parent's constructor first, passing `page` up to it."_
  This is what makes `this.page = page` (from `BasePage`'s constructor) happen for the
  child too.
- Rule: if a child class has a `constructor`, it must call `super(...)` before
  using `this`. Forgetting `super` is the #1 beginner error here.

```javascript
async open() {
  await this.goto('/');       // defined in BasePage, used here
}
async login(...) {
  await this.fill(this.usernameInput, username);   // fill = parent; usernameInput = child
}
```

- `this.goto` and `this.fill` are inherited from `BasePage`. `this.usernameInput`
  is the child's own property. The child freely mixes both.

> 🧠 The whole idea in one sentence: `LoginPage extends BasePage` so it inherits
> generic browser skills, calls `super(page)` to let the parent set itself up, then
> adds only the locators and actions unique to the login screen.

> ❓ "Wait — `goto('/')`? Where does `/` know the website is saucedemo.com?"
> Great question, and right now the honest answer is: it doesn't yet. `/` is a
> _relative_ path (just "the site root"). For it to mean
> `https://www.saucedemo.com/`, Playwright needs a base URL to attach it to — and
> we haven't set that up until Step 6 (Configuration).
>
> So until Step 6, you have two options:
>
> - Keep passing the full URL for now: `await this.goto('https://www.saucedemo.com')`.
> - Or write `goto('/')` already, knowing it will _start working_ the moment we add
>   `baseURL` in Step 6.
>
> We deliberately write the clean `goto('/')` version now and wire up the base URL
> in Step 6 — that's the exact pain (hard-coded URLs) that Step 6 exists to solve.

💡 Why this matters:

- Every page automatically gets built-in waits (fewer flaky tests) for free.
- `BasePage` is written once; all 5 page objects benefit.
- Child pages stay focused on _what's unique_ about their screen.

---

<a id="chapter-5"></a>
Step 5 — Constants: Kill the magic strings

😖 The Pain: Strings like `'/inventory.html'`, the error text
`'Epic sadface: Sorry, this user has been locked out.'`, and titles like
`'Products'` are scattered around. A typo (`'Prodcuts'`) causes a confusing failure,
and you can't reuse them.

🧠 The insight: Put every fixed string in one file and import it. If a value
changes, you change it once. Your editor also auto-completes them.

Code:

```javascript
// utils/constants.js  (excerpt)
const ROUTES = {
  LOGIN: "/",
  INVENTORY: "/inventory.html",
  CART: "/cart.html",
  CHECKOUT_STEP_ONE: "/checkout-step-one.html",
};

const MESSAGES = {
  LOCKED_OUT: "Epic sadface: Sorry, this user has been locked out.",
  INVALID_CREDENTIALS:
    "Epic sadface: Username and password do not match any user in this service",
};

const TITLES = { PRODUCTS: "Products", YOUR_CART: "Your Cart" };

export { ROUTES, MESSAGES, TITLES };
```
