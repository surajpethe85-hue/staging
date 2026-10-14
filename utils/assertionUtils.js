import { expect } from "@playwright/test";
import logger from "./logger.js";

/**
 * assertionUtils - reusable, business-readable assertion helpers.
 *
 * Wrapping `expect` gives you:
 *  - consistent logging of every verification
 *  - shorter, intention-revealing test code
 *  - a single place to change assertion behavior
 *
 * For "soft" assertions (collect all failures, fail at the end) use
 * Playwright's built-in `expect.soft(...)` inside your tests.
 */

/** Assert two values are strictly equal. */
export function assertEquals(actual, expected, message = "") {
  logger.info(`Assert equals ${message}: "${actual}" === "${expected}"`);
  expect(actual, message).toBe(expected);
}

/** Assert a value is truthy. */
export function assertTrue(value, message = "") {
  logger.info(`Assert true ${message}: ${value}`);
  expect(value, message).toBeTruthy();
}

/** Assert a value is falsy. */
export function assertFalse(value, message = "") {
  logger.info(`Assert false ${message}: ${value}`);
  expect(value, message).toBeFalsy();
}

/** Assert a string/array contains a value. */
export function assertContains(container, value, message = "") {
  logger.info(`Assert contains ${message}: "${value}"`);
  expect(container, message).toContain(value);
}

/** Assert a locator is visible (web-first, auto-retrying). */
export async function assertVisible(locator, message = "") {
  logger.info(`Assert visible ${message}`);
  await expect(locator, message).toBeVisible();
}

/** Assert a locator has exact text (web-first, auto-retrying). */
export async function assertHasText(locator, text, message = "") {
  logger.info(`Assert has text ${message}: "${text}"`);
  await expect(locator, message).toHaveText(text);
}

/** Assert the page URL contains a fragment. */
export async function assertUrlContains(page, fragment, message = "") {
  logger.info(`Assert URL contains ${message}: "${fragment}"`);
  await expect(page).toHaveURL(new RegExp(fragment));
}

export default {
  assertEquals,
  assertTrue,
  assertFalse,
  assertContains,
  assertVisible,
  assertHasText,
  assertUrlContains,
};
