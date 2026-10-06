import { BasePage } from "./BasePage";

export class LoginPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    this.page = page;
    this.username = page.locator("#user-name");
    this.password = page.locator("#password");
    this.loginBtn = page.locator("#login-button");
  }

  async open() {
    await this.openUrl("/");
  }

  async loginFlow() {
    await this.fill(this.username, "standard_user");
    await this.fill(this.password, "secret_sauce");
    await this.click(this.loginBtn);
  }
}
