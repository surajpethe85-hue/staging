import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ============================================================
// 1. Get current file path and directory
// ============================================================

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================
// 2. Select Environment
// ============================================================

const ENV_NAME = process.env.ENV || "qa";

const supportedEnvironments = ["dev", "qa", "staging"];

const selectedEnvironment = supportedEnvironments.includes(ENV_NAME)
  ? ENV_NAME
  : "qa";

// ============================================================
// 3. Build Environment JSON File Path
// ============================================================

const environmentFile = path.join(
  __dirname,
  "environments",
  `${selectedEnvironment}.json`,
);

// ============================================================
// 4. Load Environment JSON
// ============================================================

function loadEnvFile() {
  if (!fs.existsSync(environmentFile)) {
    console.warn(
      `[env.config] No environment file found for "${selectedEnvironment}". Using defaults.`,
    );
    return {};
  }

  return JSON.parse(fs.readFileSync(environmentFile, "utf-8"));
}

const fileConfig = loadEnvFile();

// ============================================================
// 5. Read Credentials / Users from JSON
// ============================================================

const fileCreds = fileConfig.credentials || {};
const fileUsers = fileCreds.users || fileConfig.users || {};
const standardUser =
  process.env.STANDARD_USER ||
  fileUsers.standard ||
  fileConfig.username ||
  "standard_user";

// ============================================================
// 6. Final Environment Configuration
// ============================================================

const env = {
  // Active environment
  name: fileConfig.name || selectedEnvironment,

  // --------------------------------------------------------
  // Application URL
  // Priority:
  // .env / Terminal → JSON → Default
  // --------------------------------------------------------

  baseURL:
    process.env.BASE_URL || fileConfig.baseURL || "https://www.saucedemo.com",

  // --------------------------------------------------------
  // Common Password
  // Priority:
  // .env / Terminal → JSON → Default
  // --------------------------------------------------------

  password: process.env.PASSWORD || fileCreds.password || "secret_sauce",

  username: standardUser,

  // --------------------------------------------------------
  // Application Users
  // --------------------------------------------------------

  users: {
    standard: standardUser,

    lockedOut:
      process.env.LOCKED_OUT_USER || fileUsers.lockedOut || "locked_out_user",

    problem: process.env.PROBLEM_USER || fileUsers.problem || "problem_user",

    performance:
      process.env.PERFORMANCE_USER ||
      fileUsers.performance ||
      "performance_glitch_user",

    error: process.env.ERROR_USER || fileUsers.error || "error_user",
  },

  // --------------------------------------------------------
  // Browser Mode
  // --------------------------------------------------------

  // Default = headless
  // HEADLESS=false → headed mode
  // HEADLESS=true  → headless mode

  headless: process.env.HEADLESS !== "false",

  // --------------------------------------------------------
  // Logging
  // --------------------------------------------------------

  logLevel: process.env.LOG_LEVEL || "info",

  // --------------------------------------------------------
  // Timeouts
  // --------------------------------------------------------

  timeouts: {
    // Maximum test execution time
    test: Number(process.env.TEST_TIMEOUT) || 60000,

    // Maximum assertion wait time
    expect: Number(process.env.EXPECT_TIMEOUT) || 10000,

    // Maximum action wait time
    action: Number(process.env.ACTION_TIMEOUT) || 15000,

    // Maximum navigation wait time
    navigation: Number(process.env.NAVIGATION_TIMEOUT) || 30000,
  },
};

// ============================================================
// 7. Export Final Configuration
// ============================================================

export default env;
