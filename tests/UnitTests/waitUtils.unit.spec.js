import { test, expect } from "@playwright/test";
import { retry, waitUntil, sleep } from "../../utils/waitUtils.js";

/**
 * Unit tests for the waitUtils helper module.
 */
test.describe("Unit: waitUtils @unit", () => {
  test("sleep waits for approximately the given time", async () => {
    const start = Date.now();
    await sleep(100);
    expect(Date.now() - start).toBeGreaterThanOrEqual(90);
  });

  test("retry succeeds after transient failures", async () => {
    let attempts = 0;
    const result = await retry(
      async () => {
        attempts += 1;
        if (attempts < 3) throw new Error("transient");
        return "ok";
      },
      { retries: 5, delay: 10, name: "flaky-op" },
    );
    expect(result).toBe("ok");
    expect(attempts).toBe(3);
  });

  test("retry throws after exhausting attempts", async () => {
    await expect(
      retry(
        async () => {
          throw new Error("always fails");
        },
        { retries: 2, delay: 10 },
      ),
    ).rejects.toThrow("always fails");
  });

  test("waitUntil resolves when the condition becomes true", async () => {
    let ready = false;
    setTimeout(() => {
      ready = true;
    }, 50);
    await waitUntil(() => ready, { timeout: 1000, interval: 10 });
    expect(ready).toBe(true);
  });

  test("waitUntil times out when condition never true", async () => {
    await expect(
      waitUntil(() => false, {
        timeout: 100,
        interval: 20,
        message: "never true",
      }),
    ).rejects.toThrow(/never true/);
  });
});
