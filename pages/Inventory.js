import { expect } from "@playwright/test";
import { BasePage } from "./BasePage";
import { TITLES } from "../utils/constants.js";

export class InventoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */

  constructor(page) {
    super(page);
    this.page = page;
    this.productTile = page.locator(".title");
  }

  async verifyPageTitle() {
    await expect(this.productTile).toHaveText("Products");
    // console.log("TItle : ", TITLES.inventory);
  }
}
