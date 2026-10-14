import { test, expect } from "../../fixtures/baseFixture.js";
import env from "../../config/env.config.js";
import { MESSAGES } from "../../utils/constants.js";
import { readFile } from "node:fs/promises";
import { PDFParse } from "pdf-parse";
import { logger } from "../../utils/logger.js";

const productName = "Sauce Labs Backpack";

// Flow: sign in, add a product, enter details, review, and finish checkout. Validates completion and confirmation text.
test("completed checkout displays the order confirmation", async ({
  loginPage,
  inventoryPage,
  cartPage,
  checkoutPage,
  checkoutCompletePage,
}, testInfo) => {
  await loginPage.open();
  await loginPage.login(env.username, env.password);
  await inventoryPage.addProductToCart(productName);
  await inventoryPage.goToCart();
  await cartPage.proceedToCheckout();
  await checkoutPage.fillCustomerInfo("Ranjeet", "Kendre", "411001");
  await checkoutPage.continue();
  await checkoutPage.finish();

  expect(await checkoutCompletePage.isOrderComplete()).toBe(true);
  await expect(checkoutCompletePage.completeHeader).toHaveText(
    MESSAGES.ORDER_COMPLETE_HEADER,
  );
  await expect(checkoutCompletePage.completeText).toHaveText(
    MESSAGES.ORDER_COMPLETE_TEXT,
  );

  const download = await checkoutCompletePage.downloadOrderPdf();
  const pdfPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(pdfPath);

  const parser = new PDFParse({ data: await readFile(pdfPath) });
  const pdf = await parser.getText();
  await parser.destroy();
  const pdfText = pdf.text.replace(/\s+/g, " ").trim();
  expect(pdfText).toContain(MESSAGES.ORDER_COMPLETE_HEADER);
  expect(pdfText).toContain(MESSAGES.ORDER_PDF_TEXT);
  logger.info("Verified order confirmation page and downloaded PDF");
});
