import { test, expect } from "@playwright/test";
import {
  randomInt,
  randomFrom,
  randomString,
  firstName,
  lastName,
  fullName,
  email,
  postalCode,
  phoneNumber,
  customer,
} from "../../utils/dataGenerator.js";

/**
 * Unit tests for the dataGenerator helper module.
 */
test.describe("Unit: dataGenerator @unit", () => {
  test("randomInt returns a value within range (inclusive)", () => {
    for (let i = 0; i < 50; i++) {
      const n = randomInt(1, 5);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(5);
    }
  });

  test("randomFrom returns an element from the array", () => {
    const arr = ["a", "b", "c"];
    expect(arr).toContain(randomFrom(arr));
  });

  test("randomString returns a string of the requested length", () => {
    expect(randomString(10)).toHaveLength(10);
    expect(randomString()).toHaveLength(8);
  });

  test("firstName / lastName / fullName return non-empty strings", () => {
    expect(firstName().length).toBeGreaterThan(0);
    expect(lastName().length).toBeGreaterThan(0);
    expect(fullName().split(" ")).toHaveLength(2);
  });

  test("email is unique and well formed", () => {
    const a = email();
    const b = email();
    expect(a).toMatch(/^[^@\s]+@[^@\s]+\.[^@\s]+$/);
    expect(a).not.toBe(b);
  });

  test("postalCode returns numeric string of given length", () => {
    const code = postalCode(5);
    expect(code).toHaveLength(5);
    expect(code).toMatch(/^\d+$/);
  });

  test("phoneNumber returns a 10-digit number starting with 9", () => {
    const phone = phoneNumber();
    expect(phone).toMatch(/^9\d{9}$/);
  });

  test("customer returns a complete object", () => {
    const c = customer();
    expect(c).toHaveProperty("firstName");
    expect(c).toHaveProperty("lastName");
    expect(c).toHaveProperty("email");
    expect(c).toHaveProperty("postalCode");
    expect(c).toHaveProperty("phone");
  });
});
