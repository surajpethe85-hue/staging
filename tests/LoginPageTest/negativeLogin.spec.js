import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import { MESSAGES } from "../../utils/constants.js";
import env from "../../config/env.config.js";
import { allureMeta, step, Severity } from "../../utils/allure.js";

/**
 * Negative Login Scenarios (Data-Driven)
 * ------------------------------------------------------------------
 * All the ways login SHOULD fail. Test cases are driven from external
 * JSON (loginData.json) so new cases can be added without touching code.
 */
const loginData = readJSON("loginData.json");
const users = readJSON("users.json");

test.describe("Login - Negative @regression", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test("TC_LOGIN_LOCKED: locked-out user sees lockout error @smoke", async ({
    loginPage,
  }) => {
    await allureMeta({
      epic: "Authentication",
      feature: "Login",
      story: "Locked-out user is blocked",
      severity: Severity.CRITICAL,
      owner: "QA Automation Team",
      tags: ["smoke", "regression", "login", "negative"],
      description:
        "A `locked_out_user` must NOT be able to log in and should see a lockout error.",
      parameters: { username: users.lockedOut.username, environment: env.name },
    });

    await step("Attempt login as locked-out user", async () => {
      await loginPage.login(users.lockedOut.username, env.password);
    });

    await step("Verify lockout error is shown", async () => {
      expect(await loginPage.getErrorMessage()).toBe(MESSAGES.LOCKED_OUT);
    });
  });

  test("TC_LOGIN_DISMISS: user can dismiss the login error message", async ({
    loginPage,
  }) => {
    await allureMeta({
      epic: "Authentication",
      feature: "Login",
      story: "Error message can be dismissed",
      severity: Severity.MINOR,
      owner: "QA Automation Team",
      tags: ["regression", "login", "negative", "ui"],
      description:
        "After a failed login, the user can dismiss the error banner via the X button.",
    });

    await step("Attempt login with invalid user", async () => {
      await loginPage.login("invalid_user", env.password);
      expect(await loginPage.hasError()).toBe(true);
    });

    await step("Dismiss the error and verify it disappears", async () => {
      await loginPage.dismissError();
      expect(await loginPage.hasError()).toBe(false);
    });
  });

  // Data-Driven: invalid credentials
  for (const data of loginData.invalidCredentials) {
    test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
      await allureMeta({
        epic: "Authentication",
        feature: "Login",
        story: "Invalid credentials are rejected",
        severity: Severity.NORMAL,
        owner: "QA Automation Team",
        tags: ["regression", "login", "negative", "data-driven"],
        description: `Data-driven case **${data.testId}**: ${data.description}`,
        parameters: {
          username: data.username || "(empty)",
          password: data.password ? "••••••" : "(empty)",
          expectedError: data.expectedError,
        },
      });

      await step(`Attempt login: ${data.description}`, async () => {
        await loginPage.login(data.username, data.password);
      });

      await step("Verify expected error message", async () => {
        expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
      });
    });
  }

  // Data-Driven: empty credentials
  for (const data of loginData.emptyCredentials) {
    test(`${data.testId}: ${data.description}`, async ({ loginPage }) => {
      await allureMeta({
        epic: "Authentication",
        feature: "Login",
        story: "Empty credentials are rejected",
        severity: Severity.NORMAL,
        owner: "QA Automation Team",
        tags: ["regression", "login", "negative", "data-driven"],
        description: `Data-driven case **${data.testId}**: ${data.description}`,
        parameters: {
          username: data.username || "(empty)",
          password: data.password || "(empty)",
          expectedError: data.expectedError,
        },
      });

      await step(`Attempt login: ${data.description}`, async () => {
        await loginPage.login(data.username, data.password);
      });

      await step("Verify expected error message", async () => {
        expect(await loginPage.getErrorMessage()).toBe(data.expectedError);
      });
    });
  }
});
