import { logger } from "../utils/logger.js";

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

  /**
   * @author Ranjeet
   * Navigate to a relative or absolute path.
   * @param {string} path
   */
  async goto(path = "/") {
    await this.page.goto(path, { waitUntil: "domcontentloaded" });
    logger.info(`Navigated to: ${this.page.url()}`);
  }

  /** Reload the current page. */
  async reload() {
    await this.page.reload();
    logger.info(`Reloaded page: ${this.page.url()}`);
  }

  /** Go back in browser history. */
  async goBack() {
    await this.page.goBack();
    logger.info(`Went back to: ${this.page.url()}`);
  }

  /** Go forward in browser history. */
  async goForward() {
    await this.page.goForward();
    logger.info(`Went forward to: ${this.page.url()}`);
  }

  /* ===== CORE INTERACTIONS ===== */

  /**
   * Click an element identified by a locator string or Locator.
   * @param {string|import('@playwright/test').Locator} locator
   */
  async click(locator) {
    const element = this._resolve(locator);

    await element.waitFor({ state: "visible" });
    await element.click();
    logger.info(`Clicked on: ${this._describe(locator)}`);
  }

  /**
   * Force-click an element (bypasses actionability checks).
   * @param {string|import('@playwright/test').Locator} locator
   */
  async forceClick(locator) {
    await this._resolve(locator).click({ force: true });
    logger.info(`Force-clicked on: ${this._describe(locator)}`);
  }

  /**
   * Double-click an element.
   * @param {string|import('@playwright/test').Locator} locator
   */
  async doubleClick(locator) {
    await this._resolve(locator).dblclick();
    logger.info(`Double-clicked on: ${this._describe(locator)}`);
  }

  /**
   * Right-click (context menu) an element.
   * @param {string|import('@playwright/test').Locator} locator
   */
  async rightClick(locator) {
    await this._resolve(locator).click({ button: "right" });
    logger.info(`Right-clicked on: ${this._describe(locator)}`);
  }

  /**
   * Type text character-by-character (simulates real typing).
   * @param {string|import('@playwright/test').Locator} locator
   * @param {string} text
   * @param {number} delay ms between keystrokes
   */
  async type(locator, text, delay = 50) {
    await this._resolve(locator).pressSequentially(text, { delay });
    logger.info(`Typed text into: ${this._describe(locator)}`);
  }

  /**
   * Clear an input field.
   * @param {string|import('@playwright/test').Locator} locator
   */
  async clear(locator) {
    await this._resolve(locator).clear();
    logger.info(`Cleared field: ${this._describe(locator)}`);
  }

  /**
   * Press a keyboard key on an element (e.g. 'Enter', 'Tab').
   * @param {string|import('@playwright/test').Locator} locator
   * @param {string} key
   */
  async pressKey(locator, key) {
    await this._resolve(locator).press(key);
    logger.info(`Pressed ${key} on: ${this._describe(locator)}`);
  }

  /**
   * Hover over an element.
   * @param {string|import('@playwright/test').Locator} locator
   */
  async hover(locator) {
    await this._resolve(locator).hover();
    logger.info(`Hovered over: ${this._describe(locator)}`);
  }

  /**
   * Drag one element and drop it onto another.
   * @param {string|import('@playwright/test').Locator} source
   * @param {string|import('@playwright/test').Locator} target
   */
  async dragAndDrop(source, target) {
    await this._resolve(source).dragTo(this._resolve(target));
    logger.info(
      `Dragged ${this._describe(source)} to ${this._describe(target)}`,
    );
  }

  /* ===== CHECKBOX / RADIO ===== */

  /** Check a checkbox/radio if not already checked. */
  async check(locator) {
    await this._resolve(locator).check();
    logger.info(`Checked: ${this._describe(locator)}`);
  }

  /** Uncheck a checkbox if checked. */
  async uncheck(locator) {
    await this._resolve(locator).uncheck();
    logger.info(`Unchecked: ${this._describe(locator)}`);
  }

  /** Whether a checkbox/radio is checked. */
  async isChecked(locator) {
    return this._resolve(locator).isChecked();
  }

  /* ===== FILE UPLOAD ===== */

  /**
   * Upload one or more files to a file input.
   * @param {string|import('@playwright/test').Locator} locator
   * @param {string|string[]} filePaths
   */
  async uploadFile(locator, filePaths) {
    await this._resolve(locator).setInputFiles(filePaths);
    const count = Array.isArray(filePaths) ? filePaths.length : 1;
    logger.info(`Uploaded ${count} file(s) to: ${this._describe(locator)}`);
  }

  /**
   * Type text into an input field.
   * @param {string|import('@playwright/test').Locator} locator
   * @param {string} text
   */
  async fill(locator, text) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    await element.fill(text);
    logger.info(`Filled field: ${this._describe(locator)}`);
  }

  /**
   * Get trimmed inner text of an element.
   * @param {string|import('@playwright/test').Locator} locator
   * @returns {Promise<string>}
   */
  async getText(locator) {
    const element = this._resolve(locator);
    await element.waitFor({ state: "visible" });
    const text = (await element.innerText()).trim();
    logger.debug(`Read text from ${this._describe(locator)}: ${text}`);
    return text;
  }

  /**
   * Get inner text for every element matching the locator.
   * @param {string|import('@playwright/test').Locator} locator
   * @returns {Promise<string[]>}
   */
  async getAllTexts(locator) {
    const element = this._resolve(locator);
    return (await element.allInnerTexts()).map((t) => t.trim());
  }

  /** Get the value of an input/textarea/select. */
  async getValue(locator) {
    return this._resolve(locator).inputValue();
  }

  /** Get an attribute value of an element. */
  async getAttribute(locator, attribute) {
    return this._resolve(locator).getAttribute(attribute);
  }

  /* ===== STATE CHECKS ===== */

  /**
   * Check if an element is visible (no throw).
   * @param {string|import('@playwright/test').Locator} locator
   * @returns {Promise<boolean>}
   */
  async isVisible(locator) {
    const element = this._resolve(locator);
    return element.isVisible();
  }

  /** Whether an element is enabled. */
  async isEnabled(locator) {
    return this._resolve(locator).isEnabled();
  }

  /** Whether an element is disabled. */
  async isDisabled(locator) {
    return this._resolve(locator).isDisabled();
  }

  /**
   * Count elements matching a locator.
   * @param {string|import('@playwright/test').Locator} locator
   * @returns {Promise<number>}
   */
  async count(locator) {
    return this._resolve(locator).count();
  }

  /* ===== DROPDOWNS (native <select>) ===== */

  /**
   * Select an option from a native dropdown by value.
   * @param {string|import('@playwright/test').Locator} locator
   * @param {string} value
   */
  async selectByValue(locator, value) {
    await this._resolve(locator).selectOption(value);
    logger.info(`Selected option "${value}" in: ${this._describe(locator)}`);
  }

  /** Select a dropdown option by its visible label. */
  async selectByLabel(locator, label) {
    await this._resolve(locator).selectOption({ label });
    logger.info(`Selected option "${label}" in: ${this._describe(locator)}`);
  }

  /** Select a dropdown option by index. */
  async selectByIndex(locator, index) {
    await this._resolve(locator).selectOption({ index });
    logger.info(
      `Selected option at index ${index} in: ${this._describe(locator)}`,
    );
  }

  /* ===== WAITS ===== */

  /**
   * Wait for an element to reach a given state.
   * @param {string|import('@playwright/test').Locator} locator
   * @param {'attached'|'detached'|'visible'|'hidden'} state
   */
  async waitFor(locator, state = "visible", timeout) {
    await this._resolve(locator).waitFor({ state, timeout });
  }

  /** Wait for the page to reach a load state. */
  async waitForLoadState(state = "load") {
    await this.page.waitForLoadState(state);
  }

  /** Wait for the URL to match a string or regex. */
  async waitForUrl(url, timeout) {
    await this.page.waitForURL(url, { timeout });
  }

  /* ===== ALERTS / DIALOGS ===== */

  /**
   * Accept the next JS dialog (alert/confirm/prompt).
   * @param {string} [promptText] optional text for prompt dialogs
   */
  async acceptDialog(promptText) {
    this.page.once("dialog", async (dialog) => {
      await dialog.accept(promptText);
    });
  }

  /** Dismiss the next JS dialog. */
  async dismissDialog() {
    this.page.once("dialog", async (dialog) => {
      await dialog.dismiss();
    });
  }

  /* ===== FRAMES / TABS ===== */

  /**
   * Get a FrameLocator for interacting inside an iframe.
   * @param {string} frameSelector
   */
  frame(frameSelector) {
    return this.page.frameLocator(frameSelector);
  }

  /**
   * Wait for and return a newly opened tab/popup triggered by an action.
   * @param {() => Promise<void>} action the action that opens the new tab
   * @returns {Promise<import('@playwright/test').Page>}
   */
  async openNewTab(action) {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      action(),
    ]);
    await newPage.waitForLoadState();
    return newPage;
  }

  /* ===== SCROLL / JS ===== */

  /** Scroll an element into view. */
  async scrollIntoView(locator) {
    await this._resolve(locator).scrollIntoViewIfNeeded();
  }

  /** Click via JavaScript (useful for stubborn elements). */
  async jsClick(locator) {
    await this._resolve(locator).evaluate((el) => el.click());
  }

  /**
   * Return the current page title.
   * @returns {Promise<string>}
   */
  async getPageTitle() {
    return this.page.title();
  }

  /**
   * Return the current URL.
   * @returns {string}
   */
  getUrl() {
    return this.page.url();
  }

  /**
   * Take a full-page screenshot and save it under test-results/.
   * @param {string} name
   * @returns {Promise<string>} the saved file path
   */
  async takeScreenshot(name = "screenshot") {
    const path = `test-results/${name}-${Date.now()}.png`;
    await this.page.screenshot({ path, fullPage: true });
    logger.info(`Saved screenshot: ${path}`);
    return path;
  }

  /**
   * Resolve a string selector or Locator into a Locator.
   * @private
   */
  _resolve(locator) {
    return typeof locator === "string" ? this.page.locator(locator) : locator;
  }
  /*
    Example usage:
    Example 1: Passing a String Locator
  await utility.click("#username");
  
  Inside the click method
  
  async click(locator) {
      const element = this._resolve(locator);
      await element.click();
  }
  
  Execution
  locator = "#username"
  typeof locator === "string"   ✔ true
  
  Returns
  this.page.locator("#username")
  So internally it becomes
  await this.page.locator("#username").click();
  
  "#username"
        │
        ▼
  _resolve()
        │
        ▼
  page.locator("#username")
        │
        ▼
  Locator Object
  
  Exmaple 2
  
  Example 2: Passing a Locator Object
  const username = page.locator("#username");
  
  await utility.click(username);
  
  Execution
  
  locator = page.locator("#username")
  typeof locator === "string"
  false
  
  Return
  
  locator
  No conversion happens.
  So internally
  await username.click();
  Flow
  
  Locator Object
        │
        ▼
  _resolve()
        │
        ▼
  Same Locator Returned
  
  Why Use _resolve()?
  Without _resolve()
  await utility.click("#username");      // Works
  
  await utility.click(page.locator("#username"));
  // ❌ May fail if your utility expects only strings
  
  With _resolve()
  
  Both work perfectly.
  await utility.click("#username");
  await utility.click(page.locator("#username"));
  */

  /**
   * Describe a locator for logging.
   * @private
   */
  _describe(locator) {
    return typeof locator === "string" ? locator : locator.toString();
  }

  /*Example 
  
    Suppose your click method is
  
  async click(locator) {
  
      console.log(`Clicking on ${this._describe(locator)}`);
  
      await this._resolve(locator).click();
  }
  Example 1: Passing a String
  await utility.click("#loginBtn");
  
  Execution
  
  locator = "#loginBtn"
  typeof locator === "string"
  
  true
  Returns
  "#loginBtn"
  Console
  Clicking on #loginBtn
  
  2. 
  Example 2: Passing a Locator Object
  const loginButton = page.locator("#loginBtn");
  
  await utility.click(loginButton);
  
  Execution
  
  locator = page.locator("#loginBtn")
  
  typeof locator === "string"
  false
  Returns
  
  locator.toString()
  Output may look like
  locator('#loginBtn')
  
  Console
  Clicking on locator('#loginBtn')
  Interview Question
  
  Q: Why do we use _resolve() in a Playwright utility class?
  
  Answer:
  
  It allows utility methods to accept both string selectors and Locator objects.
  If a string is passed, it converts it into a Locator using page.locator().
  If a Locator is passed, it returns it directly without creating a new Locator.
  
  Q: Why do we use _describe()?
  
  Answer:
  
  It is used only for logging and debugging.
  It prints a readable description of the locator.
  If a string is passed, it prints the selector.
  If a Locator object is passed, it prints its Playwright representation 
  (for example, locator('#loginBtn')), making logs easier to understand during 
  test execution.
  */
}

export default BasePage;
