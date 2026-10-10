import { expect } from "@playwright/test";

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  async openUrl(url) {
    await this.page.goto(url);
  }

  async fill(locator, text) {
    locator = await this._resolve(locator);
    await locator.fill(text);
  }

  async click(locator) {
    locator = await this._resolve(locator);
    await locator.click();
  }

  async getText(locator) {
    locator = await this._resolve(locator);
    return await locator.innerText();
  }

  _resolve(locator) {
    return typeof locator === "string" ? this.page.locator(locator) : locator;
  }
}
