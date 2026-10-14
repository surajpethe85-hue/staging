import fs from "fs";
import path from "path";
import os from "os";
import env from "./config/env.config.js";

/**
 * Global setup — runs once before the whole test run.
 *
 * Writes three files into the Allure results folder so the generated report
 * looks like a real, production-grade run:
 *   1. environment.properties -> the "Environment" widget (browser, OS, URL…)
 *   2. categories.json        -> custom defect categories (Product/Test/etc.)
 *   3. executor.json          -> the "Executor" badge (CI job, build, link)
 */
export default async function globalSetup() {
  const allureResultsDir = path.resolve("reports/allure-results");
  const allureReportDir = path.resolve("reports/allure-report");

  fs.rmSync(allureResultsDir, { recursive: true, force: true });
  fs.rmSync(allureReportDir, { recursive: true, force: true });
  fs.mkdirSync(allureResultsDir, { recursive: true });

  // 1) Environment widget ------------------------------------------------
  // Shown on the Allure "Environment" widget so anyone reading the report
  // knows the EXACT machine + environment the run executed on.
  const totalMemGB = (os.totalmem() / 1024 ** 3).toFixed(1);
  const freeMemGB = (os.freemem() / 1024 ** 3).toFixed(1);
  const cpus = os.cpus();

  const properties = {
    // --- Application / environment ---
    Environment: env.name,
    "Base.URL": env.baseURL,
    Browser: process.env.BROWSER || "chromium",

    // --- Machine / laptop details ---
    "Machine.Host": os.hostname(),
    "Machine.User": os.userInfo().username,
    OS: `${os.type()} ${os.release()}`,
    Platform: os.platform(),
    Architecture: os.arch(),
    "CPU.Model": cpus[0] ? cpus[0].model.trim() : "unknown",
    "CPU.Cores": cpus.length,
    "Memory.Total.GB": totalMemGB,
    "Memory.Free.GB": freeMemGB,

    // --- Runtime / run info ---
    "Node.Version": process.version,
    CI: process.env.CI ? "true" : "false",
    "Executed.At": new Date().toISOString(),
  };

  const content = Object.entries(properties)
    .map(([key, value]) => `${key}=${value}`)
    .join("\n");

  fs.writeFileSync(
    path.join(allureResultsDir, "environment.properties"),
    content,
    "utf-8",
  );

  // 2) Defect categories -------------------------------------------------
  // Allure buckets failures into these groups on the "Categories" tab,
  // matching the message/trace against the given regex.
  const categories = [
    {
      name: "Ignored / known issues",
      matchedStatuses: ["skipped"],
    },
    {
      name: "Product defects",
      matchedStatuses: ["failed"],
      messageRegex: ".*Epic sadface.*|.*expect.*",
    },
    {
      name: "Test/automation defects",
      matchedStatuses: ["broken"],
    },
    {
      name: "Timeouts",
      matchedStatuses: ["broken", "failed"],
      messageRegex: ".*Timeout.*|.*timed out.*",
    },
    {
      name: "Element not found",
      matchedStatuses: ["broken", "failed"],
      messageRegex: ".*not visible.*|.*not found.*|.*locator.*",
    },
  ];

  fs.writeFileSync(
    path.join(allureResultsDir, "categories.json"),
    JSON.stringify(categories, null, 2),
    "utf-8",
  );

  // 3) Executor badge ----------------------------------------------------
  const executor = {
    name: process.env.CI ? "Jenkins" : "Local",
    type: process.env.CI ? "jenkins" : "local",
    buildName: `SauceDemo Framework #${process.env.BUILD_NUMBER || "local"}`,
    buildOrder: Number(process.env.BUILD_NUMBER) || 1,
    buildUrl: process.env.BUILD_URL || "http://localhost",
    reportName: "SauceDemo Playwright Allure Report",
  };

  fs.writeFileSync(
    path.join(allureResultsDir, "executor.json"),
    JSON.stringify(executor, null, 2),
    "utf-8",
  );
}
