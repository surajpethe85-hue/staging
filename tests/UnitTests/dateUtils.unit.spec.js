import { test, expect } from "@playwright/test";
import {
  timestamp,
  today,
  addDays,
  format,
  fileTimestamp,
} from "../../utils/dateUtils.js";

/**
 * Unit tests for the dateUtils helper module.
 */
test.describe("Unit: dateUtils @unit", () => {
  test("timestamp returns a positive number", () => {
    expect(timestamp()).toBeGreaterThan(0);
  });

  test("today returns YYYY-MM-DD format", () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(today("/")).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  test("format formats a fixed date correctly", () => {
    const d = new Date(2024, 0, 5); // 5 Jan 2024
    expect(format(d)).toBe("2024-01-05");
  });

  test("addDays returns a valid future/past date string", () => {
    expect(addDays(1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(addDays(-1)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test("fileTimestamp is filename-safe", () => {
    expect(fileTimestamp()).toMatch(/^\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2}$/);
  });
});
