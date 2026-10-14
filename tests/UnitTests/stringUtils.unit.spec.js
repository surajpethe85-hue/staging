import { test, expect } from "@playwright/test";
import {
  parsePrice,
  toCurrency,
  capitalize,
  slugify,
  normalizeSpaces,
  containsIgnoreCase,
} from "../../utils/stringUtils.js";

/**
 * Unit tests for the stringUtils helper module.
 * These run without a browser — they simply validate pure functions.
 */
test.describe("Unit: stringUtils @unit", () => {
  test("parsePrice extracts a number from a currency string", () => {
    expect(parsePrice("$29.99")).toBe(29.99);
    expect(parsePrice("7.99 USD")).toBe(7.99);
    expect(parsePrice("$0.00")).toBe(0);
  });

  test("toCurrency formats a number with two decimals", () => {
    expect(toCurrency(29.9)).toBe("$29.90");
    expect(toCurrency(5, "€")).toBe("€5.00");
  });

  test("capitalize upper-cases the first letter only", () => {
    expect(capitalize("hello")).toBe("Hello");
    expect(capitalize("")).toBe("");
  });

  test("slugify converts a product name to a data-test friendly id", () => {
    expect(slugify("Sauce Labs Backpack")).toBe("sauce-labs-backpack");
    expect(slugify("Sauce Labs Bolt T-Shirt")).toBe("sauce-labs-bolt-t-shirt");
    expect(slugify("Test.allTheThings() T-Shirt (Red)")).toBe(
      "test.allthethings-t-shirt-red",
    );
  });

  test("normalizeSpaces collapses whitespace", () => {
    expect(normalizeSpaces("  a   b \n c ")).toBe("a b c");
  });

  test("containsIgnoreCase is case-insensitive", () => {
    expect(containsIgnoreCase("Hello World", "WORLD")).toBe(true);
    expect(containsIgnoreCase("Hello World", "xyz")).toBe(false);
  });
});
