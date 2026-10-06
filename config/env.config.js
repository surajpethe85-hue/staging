import "dotenv/config"; // Loads optional values from a local .env file into process.env.
import fs from "fs"; // Provides file-system methods for reading the JSON configuration.
import path from "path"; // Builds file paths safely on different operating systems.
import { fileURLToPath } from "url"; // Converts the current module URL into a normal file path.

const environment = process.env.ENV || "qa"; // Reads ENV; uses qa when ENV is not supplied.

const supportedEnvironments = ["dev", "qa", "staging"]; // Lists the environment names allowed by this framework.
// Keeps the requested environment only when it is supported; otherwise uses qa as a safe fallback.
const selectedEnvironment = supportedEnvironments.includes(environment)
  ? environment
  : "qa";
const __filename = fileURLToPath(import.meta.url); // Gets the absolute path of this env.config.js file.

const __dirname = path.dirname(__filename); // Gets the directory containing env.config.js.

// Builds the path to the JSON file for the selected environment.
const environmentFile = path.join(
  __dirname,
  "environments",
  `${selectedEnvironment}.json`,
);
// Reads the JSON file as text and converts it into a JavaScript object.
const fileConfig = JSON.parse(fs.readFileSync(environmentFile, "utf8"));

const env = {
  // Creates the final configuration object used by Playwright and tests.
  // Uses the JSON name; falls back to the selected environment name if name is missing.
  name: fileConfig.name || selectedEnvironment,
  // Priority: terminal/.env BASE_URL, selected JSON baseURL, then SauceDemo default.
  baseURL:
    process.env.BASE_URL || fileConfig.baseURL || "https://www.saucedemo.com",
  // Priority: terminal/.env STANDARD_USER, selected JSON username, then valid SauceDemo user.
  username: process.env.STANDARD_USER || fileConfig.username || "standard_user",
  // Priority: terminal/.env PASSWORD, selected JSON password, then the default password.
  password: process.env.PASSWORD || fileConfig.password || "secret_sauce",

  // HEADLESS=true means headless mode is disabled in this expression's current behavior.
  headless: process.env.HEADLESS !== "true",
  // Uses the requested log level; defaults to info when no value is supplied.
  logLevel: process.env.LOG_LEVEL || "info",

  timeouts: {
    // Groups all timeout values in milliseconds.
    // Maximum overall test time; TEST_TIMEOUT can override 60000.
    test: Number(process.env.TEST_TIMEOUT) || 60000,
    // Maximum assertion wait time; EXPECT_TIMEOUT can override 10000.
    expect: Number(process.env.EXPECT_TIMEOUT) || 10000,
    // Maximum Playwright action wait time; ACTION_TIMEOUT can override 15000.
    action: Number(process.env.ACTION_TIMEOUT) || 15000,
    // Maximum navigation wait time; NAVIGATION_TIMEOUT can override 30000.
    navigation: Number(process.env.NAVIGATION_TIMEOUT) || 30000,
  },
};

export default env; // Makes this final configuration available to other project files.
