import BasePage from "./BasePage.js";
import { ROUTES } from "../utils/constants.js";
import { slugify, parsePrice } from "../utils/stringUtils.js";
import { logger } from "../utils/logger.js";

/**
 * InventoryPage - Page Object for the products listing page.
 */
class InventoryPage extends BasePage {
  /**
   * @param {import('@playwright/test').Page} page
   */
  constructor(page) {
    super(page);

    // CSS class locator
    this.pageTitle = page.locator(".title");
    this.inventoryItems = page.locator(".inventory_item");
    this.itemNames = page.locator('[data-test="inventory-item-name"]');
    this.itemPrices = page.locator('[data-test="inventory-item-price"]');
    this.itemImages = page.locator('[data-test$="-img"]');
    // CSS attribute locator
    this.sortDropdown = page.locator('[data-test="product-sort-container"]');
    this.cartBadge = page.locator(".shopping_cart_badge");
    // XPath locator for the cart link
    this.cartLink = page.locator("//a[@class='shopping_cart_link']");

    // Burger menu — mix of CSS (id) and built-in role locator
    this.menuButton = page.locator("#react-burger-menu-btn");
    this.logoutLink = page.getByRole("link", { name: "Logout" });
    this.resetLink = page.locator("#reset_sidebar_link");

    // Footer social media links (each opens in a NEW browser tab)
    this.twitterLink = page.locator('[data-test="social-x"]');
    this.facebookLink = page.locator('[data-test="social-facebook"]');
    this.linkedinLink = page.locator('[data-test="social-linkedin"]');
  }

  /**
   * Build a locator for the "Add to cart" button of a named product.
   * @param {string} productName e.g. 'Sauce Labs Backpack'
   */
  addToCartButton(productName) {
    const id = this._toId(productName);
    return this.page.locator(`[data-test="add-to-cart-${id}"]`);
  }

  /**
   * Build a locator for the "Remove" button of a named product.
   * @param {string} productName
   */
  removeButton(productName) {
    const id = this._toId(productName);
    return this.page.locator(`[data-test="remove-${id}"]`);
  }

  /** Add a single product to the cart by name. */
  async addProductToCart(productName) {
    await this.click(this.addToCartButton(productName));
    logger.info(`Added product to cart: ${productName}`);
  }

  /** Remove a product from the cart via the inventory page. */
  async removeProductFromCart(productName) {
    await this.click(this.removeButton(productName));
    logger.info(`Removed product from cart: ${productName}`);
  }

  /** Add multiple products in one call. */
  async addMultipleProducts(productNames = []) {
    for (const name of productNames) {
      await this.addProductToCart(name);
    }
  }

  /** Number of products displayed. */
  async getProductCount() {
    return this.count(this.inventoryItems);
  }

  /** Array of all product names. */
  async getProductNames() {
    return this.getAllTexts(this.itemNames);
  }

  /** Sort products using the dropdown value. */
  async sortBy(sortValue) {
    await this.selectByValue(this.sortDropdown, sortValue);
    logger.info(`Sorted inventory using option: ${sortValue}`);
  }

  /** Get the cart badge count (0 if not present). */
  async getCartCount() {
    if (await this.isVisible(this.cartBadge)) {
      return parseInt(await this.getText(this.cartBadge), 10);
    }
    return 0;
  }

  /** Navigate to the cart page. */
  async goToCart() {
    await this.click(this.cartLink);
    logger.info("Opened the shopping cart");
  }

  /** Open a product detail page by clicking its name. */
  async openProductDetails(productName) {
    await this.click(this.itemNames.filter({ hasText: productName }));
  }

  /** Log the user out via the burger menu. */
  async logout() {
    await this.click(this.menuButton);
    await this.click(this.logoutLink);
    logger.info("Logged out of the application");
  }

  /** Reset the application state via the burger menu (clears the cart). */
  async resetAppState() {
    await this.click(this.menuButton);
    await this.click(this.resetLink);
  }

  /**
   * Open a footer social media link, which launches in a NEW browser tab,
   * and return that new tab's Page for further assertions.
   * @param {'twitter'|'facebook'|'linkedin'} network
   * @returns {Promise<import('@playwright/test').Page>} the new tab
   */
  async openSocialLink(network) {
    const links = {
      twitter: this.twitterLink,
      facebook: this.facebookLink,
      linkedin: this.linkedinLink,
    };
    const link = links[network];
    if (!link) {
      throw new Error(`Unknown social network: ${network}`);
    }
    return this.openNewTab(async () => {
      await link.click();
    });
  }

  /** Verify inventory page is loaded. */
  async isLoaded() {
    return this.getUrl().includes(ROUTES.INVENTORY);
  }

  /** Array of all product prices as numbers. */
  async getProductPrices() {
    const priceStrings = await this.getAllTexts(this.itemPrices);
    return priceStrings.map((p) => parsePrice(p));
    /*Visual flow
        this.itemPrices
          ↓
        getAllTexts()
          ↓
        [
          "$29.99",
          "$9.99",
          "$15.99"
        ]
          ↓
        map()
          ↓
        parsePrice("$29.99") → 29.99
        parsePrice("$9.99")  → 9.99
        parsePrice("$15.99") → 15.99
          ↓
        [
          29.99,
          9.99,
          15.99
        ]*/
  }

  /**
   * Get the displayed price of a single product by name.
   * @param {string} productName
   * @returns {Promise<number>}
   */
  async getProductPrice(productName) {
    const item = this.inventoryItems.filter({ hasText: productName });
    const priceText = await this.getText(item.locator(".inventory_item_price"));
    return parsePrice(priceText);
  }
  /**
   * Convert a product name into the SauceDemo data-test id fragment.
   * e.g. 'Sauce Labs Backpack' -> 'sauce-labs-backpack'
   *
   */
  _toId(productName) {
    return slugify(productName);
  }
}

export default InventoryPage;
