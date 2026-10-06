import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";

const test = base.extend({
  login: async ({ page }, use) => {
    console.log("Before Each");
    const loginObj = new LoginPage(page);
    await loginObj.open();
    await loginObj.loginFlow();

    await use();
    console.log("After Each");
  },
});

export { test, expect };
