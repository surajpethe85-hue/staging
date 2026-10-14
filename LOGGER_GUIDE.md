# Logger Guide

This guide describes the logging implementation currently used by this Playwright framework and explains how to add logging to page objects, tests, and utilities.

## 1. Overview

The framework uses Winston through a shared logger exported by [utils/logger.js](utils/logger.js). The same instance is used by page objects, tests, the Allure helper, and a custom Playwright reporter.

The logger is responsible for:

- Writing timestamped messages to the terminal and log files.
- Giving messages a level, symbol, and (in the terminal) a color.
- Recording Playwright test outcomes through the custom reporter.
- Allowing `LOG_LEVEL` to control how much detail is emitted.

## 2. Log Levels

The framework defines its own Winston level order. Lower numbers are more severe; the configured level includes messages at that level and more severe levels.

| Method                  | Priority | Use it for                                                         |
| ----------------------- | -------: | ------------------------------------------------------------------ |
| `logger.error(message)` |        0 | An operation or helper failed unexpectedly.                        |
| `logger.fail(message)`  |        1 | A Playwright test did not reach its expected status.               |
| `logger.warn(message)`  |        2 | A recoverable issue, such as an optional reporting helper failing. |
| `logger.pass(message)`  |        3 | A test reached its expected status.                                |
| `logger.info(message)`  |        4 | Important actions and verified workflow milestones.                |
| `logger.debug(message)` |        5 | Detailed diagnostic information useful when troubleshooting.       |

At the default `info` level, `error`, `fail`, `warn`, `pass`, and `info` messages are emitted. `debug` messages are filtered out. Setting the level to `debug` enables all six levels.

## 3. Log Destinations

The logger resolves its `logs` directory relative to the Node.js current working directory and creates the directory if needed. When commands are run from the project root, the files are:

| File                      | Contents                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| `logs/test-execution.log` | All emitted messages allowed by the configured `LOG_LEVEL`.        |
| `logs/error.log`          | `error` and `fail` messages allowed by the configured `LOG_LEVEL`. |

The terminal output is colorized. File output is not. Each formatted line includes a timestamp, a level symbol, the uppercase level name, and the message. If a stack is supplied, the formatter uses it as the message text.

There is currently no log rotation or automatic cleanup configured, so log files can grow over time.

## 4. Existing Framework Integration

### Page objects

[pages/BasePage.js](pages/BasePage.js) logs successful common actions such as navigation, clicking, filling, selection, and screenshots. It uses `debug` for reading text. Page-specific classes add context for higher-level operations.

[pages/LoginPage.js](pages/LoginPage.js) logs login form submission, debug details for displayed login errors, and an `error` plus a rethrow if the form interaction itself throws. Credentials are not included in these messages.

### Test specifications

Specs import the shared instance and log useful business-level outcomes, such as verifying a cart, checkout validation, sorting, or order completion. A spec should log only at meaningful checkpoints; the underlying page object already logs its common browser actions.

### Allure helper

[utils/allure.js](utils/allure.js) is designed to let tests continue when an optional Allure call fails. It logs a warning for a caught reporting error, then preserves the helper's fail-safe behavior.

### Playwright reporter

[playwright.config.js](playwright.config.js) registers `./utils/logger.js` as a reporter. Its default export is `LogReporter`:

- Skipped tests are logged with `info`.
- Tests whose status matches `expectedStatus` are logged with `pass`.
- Tests whose status does not match `expectedStatus` are logged with `fail`.

The reporter runs at test end. It does not currently log a test-start event or the exception stack for a failed test. The error details should be logged by the code handling an operation when additional context is needed.

## 5. Using the Logger

Import the shared instance rather than creating a new logger for each page or test:

```js
import { logger } from "../utils/logger.js";
```

Use the corresponding relative path from the current file. For example, test specs under `tests/<suite>/` use:

```js
import { logger } from "../../utils/logger.js";
```

### Log a successful page action

Log after the action succeeds. Do not include passwords, tokens, or other secrets.

```js
async submitSearch(query) {
    await this.searchInput.fill(query);
    await this.searchButton.click();
    logger.info('Submitted product search');
}
```

### Log an unexpected operation failure

Log the error and rethrow it. Logging alone must not turn a failed Playwright operation into a passing test.

```js
try {
  await this.submitOrderButton.click();
  logger.info("Submitted the order");
} catch (error) {
  const details =
    error instanceof Error ? error.stack || error.message : String(error);
  logger.error(`Order submission failed: ${details}`);
  throw error;
}
```

Use `warn` instead of `error` if the issue is recoverable and the framework intentionally continues. Use `debug` for detailed values that are useful during diagnosis but too noisy for normal runs.

### Log a test assertion milestone

Log after the assertion passes so the message reflects a verified result:

```js
await expect(cartPage.cartItems).toHaveCount(1);
logger.info("Verified one item in the cart");
```

Do not catch assertion failures only to log them unless the test can add useful context and then rethrows the assertion error. The custom reporter already records the final pass/fail status.

## 6. Configure the Log Level

[config/env.config.js](config/env.config.js) reads `LOG_LEVEL` from the environment and defaults to `info`. It is independent of the selected application environment (`dev`, `qa`, or `staging`).

For a detailed diagnostic run in macOS or Linux:

```bash
LOG_LEVEL=debug npm run test:qa
```

To reduce output to warnings and more severe messages:

```bash
LOG_LEVEL=warn npm run test:qa
```

The same setting can be placed in a local `.env` file because the environment config loads `dotenv/config`. Do not commit secrets in `.env`.

To follow the execution log while tests run:

```bash
tail -f logs/test-execution.log
```

## 7. Adding Logging to a New Framework

1. Install Winston as a development dependency: `npm install --save-dev winston`.
2. Create a logger utility that defines the levels, formats, and transports required by the project.
3. Export one shared logger instance so pages, tests, utilities, and the reporter write consistently.
4. Register the reporter in Playwright's top-level `reporter` configuration if automatic test outcome logging is required.
5. Import the shared logger into page objects, specs, or utilities and log meaningful outcomes.
6. Add a configurable log level, defaulting to a useful level such as `info`.
7. Verify that a normal run writes the execution log and that a controlled failure produces the expected error/failure output.

This project already has these integration points. For new code, follow the examples above instead of adding another logger instance or changing the shared logger configuration for a single test.

## 8. Important Questions and Answers

**Where are the logs?**

In `logs/test-execution.log` and `logs/error.log`, relative to the process working directory. Running the npm scripts from the project root writes them under the project's `logs/` directory.

**Why is a debug message missing?**

The default level is `info`, which filters out `debug`. Run with `LOG_LEVEL=debug` to include it.

**What is the difference between `error` and `fail`?**

Use `error` for an unexpected operation or utility exception. `fail` is the reporter's summary that a test ended in a status other than its expected status. Both are written to `error.log` at the default level.

**Does `logger.error()` fail the test?**

No. Logging records information; it does not change control flow. Rethrow the caught error when the operation must still fail the test.

**Should an expected negative scenario use `error`?**

Usually not. For example, a login test that verifies an invalid password produces an error message is exercising expected application behavior. Use `info` for the verified outcome and reserve `error` for an unexpected automation or framework failure.

**Can I log a password or token to diagnose a test?**

No. Do not log passwords, access tokens, cookies, or other secrets. Prefer a safe identifier, test-data label, or redacted value.

**Why can messages from parallel tests be interleaved?**

All tests use the shared logger and write to the same files. Include the test title or a safe workflow identifier in custom messages when needed to distinguish activity. The current formatter does not automatically add a worker or test ID to each page-object message.

**Are logs rotated or cleared automatically?**

No. The current Winston setup writes to fixed filenames and does not configure rotation or cleanup. Clean old generated logs according to your team's retention policy, or add a rotating transport if long-running CI jobs require it.

**Does an expected test failure count as a logger failure?**

No. The reporter compares the result status with `test.expectedStatus`. If they match, it logs `pass`, even for a test intentionally expected to fail.

## 9. Logging Checklist

- Use the shared named export: `import { logger } from '.../utils/logger.js'`.
- Prefer `info` for meaningful completed actions and verified outcomes.
- Use `error` for unexpected exceptions and rethrow when the test should fail.
- Use `warn` for recoverable issues and `debug` for diagnostic detail.
- Do not log secrets or sensitive personal data.
- Avoid duplicate messages when a shared `BasePage` method already logs the same low-level action.
- Confirm the output files and configured level when investigating missing messages.
