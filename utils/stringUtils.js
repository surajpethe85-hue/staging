/**
 * stringUtils - reusable string/number helpers used across tests
 * (parsing prices, capitalizing, trimming, slugifying).
 */

/**
 * Extract a number from a currency/price string, e.g. "$29.99" -> 29.99.
 * @param {string} priceString
 * @returns {number}
 */
export function parsePrice(priceString) {
  return parseFloat(String(priceString).replace(/[^\d.-]/g, ""));
}

/**
 * Format a number as a currency string, e.g. 29.99 -> "$29.99".
 * @param {number} amount
 * @param {string} [symbol='$']
 */
export function toCurrency(amount, symbol = "$") {
  return `${symbol}${Number(amount).toFixed(2)}`;
}

/** Capitalize the first letter of a string. */
export function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Convert text to a URL/data-test friendly slug, e.g. "Sauce Labs Backpack" -> "sauce-labs-backpack". */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[()]/g, "")
    .replace(/\s+/g, "-"); //The g means global, so remove all occurrences.
  // \s+ means one or more whitespace characters.
  //slugify("Sauce Labs Backpack")
  ("Sauce Labs Backpack");
  /*       ↓
                                     String(text)
                                             ↓
                                     "Sauce Labs Backpack"
                                             ↓
                                     .toLowerCase()
                                             ↓
                                     "sauce labs backpack"
                                             ↓
                                     .trim()
                                             ↓
                                     "sauce labs backpack"
                                             ↓
                                     .replace(/[()]/g, '')
                                             ↓
                                     "sauce labs backpack"
                                             ↓
                                     .replace(/\s+/g, '-')
                                             ↓
                                     "sauce-labs-backpack"
                                     
                                     */
}

/** Remove all extra whitespace and trim. */
export function normalizeSpaces(text) {
  return String(text).replace(/\s+/g, " ").trim();
}

/** Check if a string contains a substring (case-insensitive). */
export function containsIgnoreCase(haystack, needle) {
  return String(haystack).toLowerCase().includes(String(needle).toLowerCase());
}

export default {
  parsePrice,

  toCurrency,
  capitalize,
  slugify,
  normalizeSpaces,

  containsIgnoreCase,
};
