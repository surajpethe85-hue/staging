import { test, expect } from "../../fixtures/baseFixture.js";
import users from "../../test-data/users.json" with { type: "json" };
import { logger } from "../../utils/logger.js";

for (const [userType, user] of Object.entries(users)) {
  test(`Data driven test for ${userType}`, async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.login(user.username, user.password);

    if (user.expectedError) {
      await expect(loginPage.errorMessage).toHaveText(user.expectedError);
      logger.info(`Verified expected login error for ${userType}`);
    } else {
      await expect(loginPage.page).toHaveURL(/inventory\.html/);
      logger.info(
        `Verified successful navigation to inventory page: ${loginPage.page.url()}`,
      );
    }
  });
}
