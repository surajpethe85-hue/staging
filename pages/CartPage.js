import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import { slugify, parsePrice } from "../utils/stringUtils.js";
import { logger } from "../utils/logger.js";

/**
 * CartPage - Page Object for the shopping cart page.
 */
class CartPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // CSS locators
    this.pageTitle = page.locator(".title");
    this.cartItems = page.locator(".cart_item");
    this.cartItemNames = this.cartItems.locator(".inventory_item_name");
    this.cartItemPrices = this.cartItems.locator(".inventory_item_price");
    // Built-in role locators for the action buttons
    this.checkoutButton = page.getByRole("button", { name: "Checkout" });
    this.continueShoppingButton = page.getByRole("button", {
      name: "Continue Shopping",
    });
    // XPath locator for the cart badge
    this.cartBadge = page.locator("//span[@class='shopping_cart_badge']");
  }

  /** Build the Remove button locator for a product name. */
  removeButton(productName) {
    const id = slugify(productName);
    return this.page.locator(`[data-test="remove-${id}"]`);
  }

  /** Open the cart page directly. */
  async open() {
    await this.goto(ROUTES.CART);
  }

  /** Number of items in the cart. */
  async getItemCount() {
    return this.count(this.cartItems);
  }

  /** All product names currently in the cart. */
  async getCartItemNames() {
    return this.getAllTexts(this.cartItemNames);
  }

  /** All product prices in the cart as numbers. */
  async getCartItemPrices() {
    const priceStrings = await this.getAllTexts(this.cartItemPrices);

    const prices = [];

    for (const price of priceStrings) {
      prices.push(parsePrice(price));
    }

    return prices;
  }

  /** Remove a specific product from the cart. */
  async removeItem(productName) {
    logger.info(`Removing item from cart: ${productName}`);
    await this.click(this.removeButton(productName));
  }

  /** Proceed to checkout. */
  async proceedToCheckout() {
    await this.click(this.checkoutButton);
    logger.info("Started checkout from the cart");
  }

  /** Continue shopping (back to inventory). */
  async continueShopping() {
    await this.click(this.continueShoppingButton);
    logger.info("Returned to inventory from the cart");
  }

  /** Get the cart badge count (0 if empty). */
  async getCartCount() {
    if (await this.isVisible(this.cartBadge)) {
      return parseInt(await this.getText(this.cartBadge), 10);
    }
    return 0;
  }
}

export default CartPage;
