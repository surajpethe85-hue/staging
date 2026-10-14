import { test, expect } from "../../fixtures/baseFixture.js";
import env from "../../config/env.config.js";
import { MESSAGES } from "../../utils/constants.js";
import { logger } from "../../utils/logger.js";

// Flow: open the login page and submit invalid credentials. Validates the visible error and its expected message.
test("invalid credentials display a login error", async ({ loginPage }) => {
  await loginPage.open();
  logger.info(`Opened login page: ${loginPage.page.url()}`);
  await loginPage.login("invalid_user", "invalid_password");
  logger.info("Submitted invalid credentials");
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toHaveText(MESSAGES.INVALID_CREDENTIALS);
  logger.info(`Verified error message: ${MESSAGES.INVALID_CREDENTIALS}`);
});

// Flow: open the login page and sign in with the configured standard user. Validates navigation to inventory.
test("standard user can log in successfully", async ({ loginPage }) => {
  await loginPage.open();
  logger.info(`Opened login page: ${loginPage.page.url()}`);
  await loginPage.login(env.users.standard, env.password);
  logger.info(`Submitted credentials for user: ${env.username}`);
  await expect(loginPage.page).toHaveURL(/inventory\.html/);
  logger.info(
    `Verified successful navigation to inventory page: ${loginPage.page.url()}`,
  );
});
