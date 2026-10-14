import logger from "./logger.js";

/**
 * waitUtils - reusable, framework-level wait & retry helpers.
 *
 * Real frameworks avoid hard-coded `waitForTimeout` sleeps. These helpers
 * give you smart, condition-based waits and a generic retry wrapper.
 */

/**
 * Retry an async function until it succeeds or attempts are exhausted.
 * Useful for flaky steps (network, animations, eventual consistency).
 *
 * @template T
 * @param {() => Promise<T>} fn the async action to retry
 * @param {object} [options]
 * @param {number} [options.retries=3] number of attempts
 * @param {number} [options.delay=1000] ms to wait between attempts
 * @param {string} [options.name='action'] label for logging
 * @returns {Promise<T>}
 */
export async function retry(
  fn,
  { retries = 3, delay = 1000, name = "action" } = {},
) {
  let lastError;
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        await sleep(delay);
      }
    }
  }
  throw lastError;
}

/**
 * Poll a condition function until it returns true or times out.
 *
 * @param {() => Promise<boolean>|boolean} condition
 * @param {object} [options]
 * @param {number} [options.timeout=10000] total ms to wait
 * @param {number} [options.interval=500] ms between polls
 * @param {string} [options.message='condition'] label for the error
 * @returns {Promise<void>}
 */
export async function waitUntil(
  condition,
  { timeout = 10000, interval = 500, message = "condition" } = {},
) {
  const endTime = Date.now() + timeout;
  while (Date.now() < endTime) {
    if (await condition()) {
      return;
    }
    await sleep(interval);
  }
  throw new Error(`Timed out after ${timeout}ms waiting for: ${message}`);
}

/**
 * Simple promise-based delay. Use sparingly — prefer condition-based waits.
 * @param {number} ms
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default { retry, waitUntil, sleep };
