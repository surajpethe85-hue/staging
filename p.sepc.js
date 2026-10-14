import { test, expect } from '../../fixtures/baseFixture.js';
import { readJSON } from '../../utils/dataReader.js';
import env from '../../config/env.config.js';

const users = readJSON('users.json');

test.describe('Login - Positive @regression', () => {

    test.beforeEach(async ({ loginPage }) => {
        await loginPage.open();
    });

    test('TC_LOGIN_VALID: valid standard user can log in @smoke', async ({ loginPage, inventoryPage }) => {

        await loginPage.login(env.users.standard, env.password);

        expect(await inventoryPage.isLoaded()).toBeTruthy();
        await expect(inventoryPage.pageTitle).toHaveText('Products');
    });

    test('TC_LOGIN_PROBLEM: problem user can log in', async ({ loginPage, inventoryPage }) => {

        await loginPage.login(users.problem.username, env.password);

        expect(await inventoryPage.isLoaded()).toBeTruthy();
    });

    test('TC_LOGIN_PERF: performance glitch user can log in', async ({ loginPage, inventoryPage }) => {

        await loginPage.login(users.performance.username, env.password);

        await expect(inventoryPage.pageTitle).toHaveText('Products');
    });
});