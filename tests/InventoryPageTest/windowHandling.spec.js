import { test, expect } from "../../fixtures/baseFixture.js";

/**
 * Window / Tab Handling Scenarios
 * ------------------------------------------------------------------
 * The SauceDemo footer has Twitter, Facebook and LinkedIn icons.
 * Each opens the social page in a NEW browser tab. These tests verify
 * multi-tab handling: triggering the new tab, switching to it, asserting
 * its URL, then closing it and returning to the original tab.
 */
test.describe("Window / Tab Handling @regression", () => {
  // All tests need an authenticated session (footer only shows after login)
  test.beforeEach(async ({ loggedInPage }) => {
    void loggedInPage;
  });

  const socialLinks = [
    {
      testId: "TC_WIN_01",
      network: "twitter",
      expectedUrl: /(twitter|x)\.com/,
    },
    { testId: "TC_WIN_02", network: "facebook", expectedUrl: /facebook\.com/ },
    { testId: "TC_WIN_03", network: "linkedin", expectedUrl: /linkedin\.com/ },
  ];

  for (const { testId, network, expectedUrl } of socialLinks) {
    test(`${testId}: ${network} icon opens in a new tab`, async ({
      inventoryPage,
      page,
    }) => {
      // Open the social link — returns the newly opened tab
      const newTab = await inventoryPage.openSocialLink(network);

      // Assert the new tab navigated to the expected external site
      await expect(newTab).toHaveURL(expectedUrl);

      // Close the new tab and confirm we are back on the inventory tab
      await newTab.close();
      expect(page.url()).toContain("inventory.html");
    });
  }

  test("TC_WIN_04: original tab stays on inventory after opening a social tab @smoke", async ({
    inventoryPage,
    page,
    context,
  }) => {
    expect(context.pages()).toHaveLength(1);

    const newTab = await inventoryPage.openSocialLink("twitter");

    // Two tabs are now open in the same browser context
    expect(context.pages()).toHaveLength(2);
    // The original tab is unchanged
    expect(page.url()).toContain("inventory.html");

    await newTab.close();
    expect(context.pages()).toHaveLength(1);
  });
});
