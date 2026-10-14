import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import { logger } from "../utils/logger.js";

/**
 * CheckoutCompletePage - Page Object for the order confirmation page.
 */
class CheckoutCompletePage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    this.pageTitle = page.locator(".title");
    // XPath locator for the confirmation header
    this.completeHeader = page.locator("//h2[@class='complete-header']");
    // CSS locator
    this.completeText = page.locator(".complete-text");
    // Built-in role locator
    this.backHomeButton = page.getByRole("button", { name: "Back Home" });
    this.generatePdfButton = page.getByRole("button", { name: /Generate PDF/ });
    // XPath locator for the pony express image
    this.ponyExpressImage = page.locator("//img[@class='pony_express']");
  }

  /** Confirmation header text ("Thank you for your order!"). */
  async getHeaderText() {
    return this.getText(this.completeHeader);
  }

  /** Confirmation body text. */
  async getCompleteText() {
    return this.getText(this.completeText);
  }

  /** Click "Back Home" to return to inventory. */
  async backHome() {
    await this.click(this.backHomeButton);
  }

  /** Download the order confirmation PDF. */
  async downloadOrderPdf() {
    const downloadPromise = this.page.waitForEvent("download");
    await this.click(this.generatePdfButton);
    logger.info("Requested order confirmation PDF download");
    return downloadPromise;
  }

  /** Whether the confirmation page is displayed. */
  async isOrderComplete() {
    await this.page.waitForURL(`**${ROUTES.CHECKOUT_COMPLETE}`);
    await this.completeHeader.waitFor({ state: "visible" });
    return this.getUrl().includes(ROUTES.CHECKOUT_COMPLETE);
    //  **/checkout-complete.html
    // ^^
    // ||
    // Anything before this
  }
}

export default CheckoutCompletePage;
