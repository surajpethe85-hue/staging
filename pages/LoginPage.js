import { test } from "@playwright/test";
import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import { logger } from "../utils/logger.js";

/**
 * LoginPage - Page Object for the SauceDemo login screen.
 *
 * Demonstrates a MIX of locator strategies (as used in real projects):
 *  - Built-in Playwright locators (getByPlaceholder / getByRole) — preferred
 *  - CSS locators
 *  - XPath — for cases where CSS is awkward or to teach XPath
 */
export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Locators (kept in the Page Object, never in test files)
    // Built-in locator (recommended modern approach)
    this.usernameInput = page.getByPlaceholder("Username");
    // CSS locator
    this.passwordInput = page.locator("#password");
    // Built-in role locator
    this.loginButton = page.getByRole("button", { name: "Login" });
    // CSS attribute locator
    this.errorMessage = page.locator('[data-test="error"]');
    // XPath locator (demonstrates XPath usage)
    this.errorButton = page.locator("//button[@class='error-button']");
    // XPath locator for the logo
    this.loginLogo = page.locator("//div[@class='login_logo']");

    // test = "#usernae";
  }

  /** Open the login page. */
  async open() {
    await this.goto(ROUTES.LOGIN);
  }

  /**
   * Perform a login with the given credentials.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    try {
      await test.step(`Login as "${username}"`, async () => {
        await this.fill(this.usernameInput, username);
        await this.fill(this.passwordInput, password);
        await this.click(this.loginButton);
      });
      logger.info("Submitted login form");
    } catch (error) {
      const details =
        error instanceof Error ? error.stack || error.message : String(error);
      logger.error(`Login form submission failed: ${details}`);
      throw error;
    }
  }

  /**
   * @author John Doe
   * Get the displayed error message text.
   * @returns {Promise<string>}
   */
  async getErrorMessage() {
    const message = await this.getText(this.errorMessage);
    logger.debug(`Login error displayed: ${message}`);
    return message;
  }

  /**
   * Whether an error message is shown.
   * @returns {Promise<boolean>}
   */
  async hasError() {
    const visible = await this.isVisible(this.errorMessage);
    logger.debug(`Login error visible: ${visible}`);
    return visible;
  }

  /**
   * Dismiss the displayed error message by clicking the error (X) button.
   */
  async dismissError() {
    await this.click(this.errorButton);
    logger.info("Dismissed login error message");
  }
}

export default LoginPage;
