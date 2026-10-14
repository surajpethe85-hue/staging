import { test, expect } from "../../fixtures/baseFixture.js";
import { readJSON } from "../../utils/dataReader.js";
import env from "../../config/env.config.js";
import { allureMeta, step, attachJSON, Severity } from "../../utils/allure.js";

/**
 * Positive Login Scenarios
 * ------------------------------------------------------------------
 * Valid users that ARE able to log in successfully and land on the
 * inventory (Products) page.
 */
const users = readJSON("users.json");

test.describe("Login - Positive @regression", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.open();
  });

  test("TC_LOGIN_VALID: valid standard user can log in @smoke", async ({
    loginPage,
    inventoryPage,
  }) => {
    await allureMeta({
      epic: "Authentication",
      feature: "Login",
      story: "Valid user can log in",
      severity: Severity.BLOCKER,
      owner: "QA Automation Team",
      tags: ["smoke", "regression", "login"],
      description: [
        "### Objective",
        "Verify that a **standard user** can log in and land on the Products page.",
        "",
        "**Precondition:** SauceDemo is reachable.",
        "**Expected:** Products page is shown after login.",
      ].join("\n"),
      parameters: { username: env.users.standard, environment: env.name },
      issue: {
        name: "AUTH-101",
        url: "https://jira.example.com/browse/AUTH-101",
      },
      tms: {
        name: "TC_LOGIN_VALID",
        url: "https://testrail.example.com/cases/1001",
      },
    });

    await step("Log in as standard user", async () => {
      await loginPage.login(env.users.standard, env.password);
    });

    await step("Verify inventory page is loaded", async () => {
      expect(await inventoryPage.isLoaded()).toBeTruthy();
      await expect(inventoryPage.pageTitle).toHaveText("Products");
    });

    await attachJSON("login-context", {
      username: env.users.standard,
      landingPage: "Products",
      environment: env.name,
    });
  });

  test("TC_LOGIN_PROBLEM: problem user can log in", async ({
    loginPage,
    inventoryPage,
  }) => {
    await allureMeta({
      epic: "Authentication",
      feature: "Login",
      story: "Problem user can log in (UI issues expected)",
      severity: Severity.NORMAL,
      owner: "QA Automation Team",
      tags: ["regression", "login"],
      description:
        "The `problem_user` logs in successfully but has known UI/product defects.",
      parameters: { username: users.problem.username, environment: env.name },
    });

    await step("Log in as problem user", async () => {
      await loginPage.login(users.problem.username, env.password);
    });

    await step("Verify inventory page is loaded", async () => {
      expect(await inventoryPage.isLoaded()).toBeTruthy();
    });
  });

  test("TC_LOGIN_PERF: performance glitch user can log in", async ({
    loginPage,
    inventoryPage,
  }) => {
    await allureMeta({
      epic: "Authentication",
      feature: "Login",
      story: "Performance glitch user can log in (with delay)",
      severity: Severity.MINOR,
      owner: "QA Automation Team",
      tags: ["regression", "login", "performance"],
      description:
        "The `performance_glitch_user` logs in but with a deliberate delay.",
      parameters: {
        username: users.performance.username,
        environment: env.name,
      },
    });

    await step("Log in as performance glitch user", async () => {
      await loginPage.login(users.performance.username, env.password);
    });

    await step("Verify Products title is shown", async () => {
      await expect(inventoryPage.pageTitle).toHaveText("Products");
    });
  });
});
