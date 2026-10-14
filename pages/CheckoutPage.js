import BasePage from "./BasePage.js";
import { parsePrice } from "../utils/stringUtils.js";
import { logger } from "../utils/logger.js";

/**
 * CheckoutPage - Page Object for checkout step one (info) and
 * step two (overview) pages.
 */
class CheckoutPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // Step One - Your Information (built-in placeholder locators)
    this.firstNameInput = page.getByPlaceholder("First Name");
    this.lastNameInput = page.getByPlaceholder("Last Name");
    this.postalCodeInput = page.getByPlaceholder("Zip/Postal Code");
    this.continueButton = page.locator('[data-test="continue"]');
    // XPath locator for cancel button
    this.cancelButton = page.locator("//button[@data-test='cancel']");
    this.errorMessage = page.locator('[data-test="error"]');

    // Step Two - Overview
    this.finishButton = page.getByRole("button", { name: "Finish" });
    // XPath locators for the summary labels
    this.summarySubtotal = page.locator(
      "//div[@class='summary_subtotal_label']",
    );
    this.summaryTax = page.locator("//div[@class='summary_tax_label']");
    this.summaryTotal = page.locator("//div[@class='summary_total_label']");
    this.cartItemPrices = page.locator(".inventory_item_price");
    this.pageTitle = page.locator(".title");
  }

  /**
   * Fill the customer information form.
   * @param {string} firstName
   * @param {string} lastName
   * @param {string} postalCode
   */
  async fillCustomerInfo(firstName, lastName, postalCode) {
    if (firstName !== undefined && firstName !== "") {
      await this.fill(this.firstNameInput, firstName);
    }
    if (lastName !== undefined && lastName !== "") {
      await this.fill(this.lastNameInput, lastName);
    }
    if (postalCode !== undefined && postalCode !== "") {
      await this.fill(this.postalCodeInput, postalCode);
    }
    logger.info("Entered customer information for checkout");
  }

  /** Click continue to move to the overview step. */
  async continue() {
    await this.click(this.continueButton);
    logger.info("Continued to checkout overview");
  }

  /** Cancel the checkout. */
  async cancel() {
    await this.click(this.cancelButton);
  }

  /** Finish the order. */
  async finish() {
    await this.click(this.finishButton);
    logger.info("Submitted the order");
  }

  /** Get the checkout error message text. */
  async getErrorMessage() {
    return this.getText(this.errorMessage);
  }

  /** Subtotal (item total) value as a number. */
  async getSubtotal() {
    const text = await this.getText(this.summarySubtotal);
    return parsePrice(text);
  }

  /** Tax value as a number. */
  async getTax() {
    const text = await this.getText(this.summaryTax);
    return parsePrice(text);
  }

  /** Total value as a number. */
  async getTotal() {
    const text = await this.getText(this.summaryTotal);
    return parsePrice(text);
  }
}

export default CheckoutPage;
