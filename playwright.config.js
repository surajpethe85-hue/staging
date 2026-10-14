// @ts-check
import { defineConfig, devices } from "@playwright/test";
import env from "./config/env.config.js";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",
  timeout: env.timeouts.test, // 30 seconds
  /* Run tests in files in parallel */
  globalSetup: "./global-setup.js",

  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry once locally and twice on CI. */
  retries: process.env.CI ? 2 : 1,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : 4,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // reporter: 'html',
  reporter: [
    // ← SUMMARIES (10.1)
    ["list"], // live console output
    ["html", { outputFolder: "reports/html-report" }], // clickable HTML report
    ["allure-playwright", { resultsDir: "reports/allure-results" }], // rich report
    ["./utils/logger.js"],
  ],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    // trace: 'on-first-retry',
    // baseURL: 'https://www.saucedemo.com',
    headless: env.headless,

    baseURL: env.baseURL,
    actionTimeout: env.timeouts.action,
    navigationTimeout: env.timeouts.navigation,
    trace: "retain-on-failure", // step-by-step timeline, only if it fails
    screenshot: "only-on-failure", // picture at the moment of failure
    video: "retain-on-failure", // recording, only if it fails,
    reporter: [
      // ← SUMMARIES (10.1)
      ["list"], // live console output
      ["html", { outputFolder: "reports/html-report" }], // clickable HTML report
      ["allure-playwright", { resultsDir: "reports/allure-results" }], // rich report
    ],
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },

    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },

    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
