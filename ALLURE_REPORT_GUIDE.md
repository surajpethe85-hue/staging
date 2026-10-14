# Allure Report Guide

This guide follows Allure reporting through the framework, from dependencies and Playwright configuration to raw test results, report generation, viewing, and optional test metadata. It describes the current implementation and calls out places that are available but not yet used by test specs.

## 1. Allure At A Glance

The framework uses three related pieces:

- `allure-playwright` integrates Playwright test execution with Allure.
- `allure-js-commons` provides Allure metadata, steps, and attachment APIs.
- `allure-commandline` generates and serves the HTML report from raw result files.

The flow is:

```text
Playwright test run
        |
        +--> allure-playwright reporter
                  |
                  v
        reports/allure-results/
        (JSON test records and attachment files)
                  |
          Allure CLI generate
                  |
                  v
        reports/allure-report/
        (static HTML report)
                  |
          Allure CLI open
                  v
        Browser report
```

## 2. Framework Files

| File or directory         | Responsibility                                                                  |
| ------------------------- | ------------------------------------------------------------------------------- |
| `package.json`            | Allure dependencies and run/generate/open/serve scripts.                        |
| `playwright.config.js`    | Registers `allure-playwright` and selects its raw results directory.            |
| `utils/allure.js`         | Fail-safe wrappers for metadata, steps, and attachments.                        |
| `tests/`                  | Test scenarios; this is where test-level metadata and named steps can be added. |
| `reports/allure-results/` | Raw reporter output: result JSON and attachment files.                          |
| `reports/allure-report/`  | Generated HTML report.                                                          |

The declared packages are `allure-playwright`, `allure-js-commons`, and `allure-commandline`. They are already in this project's `devDependencies`.

## 3. Playwright Reporter Configuration

The root-level `reporter` array in `playwright.config.js` includes:

```js
reporter: [
    ['list'],
    ['html', { outputFolder: 'reports/html-report' }],
    ['allure-playwright', { resultsDir: 'reports/allure-results' }],
    ['./utils/logger.js'],
],
```

The reporters are independent outputs from the same test run:

- `list` prints live progress in the terminal.
- `html` creates the Playwright HTML report in `reports/html-report`.
- `allure-playwright` writes Allure result data to `reports/allure-results`.
- `./utils/logger.js` is the framework's custom Playwright logger reporter; it is not the Allure reporter.

The current config also has another reporter array nested under `use`. The project-wide reporter setup is the root-level `reporter` setting shown above. Avoid adding another Allure reporter in individual tests or creating a second results directory unless there is a specific reason.

Playwright is configured to keep traces and videos on failure and to take screenshots on failure. These are useful test artifacts; inspect the generated result attachments and `test-results/` for the artifacts produced by a particular run.

## 4. Raw Results Versus HTML Report

These are different stages and different directories:

- `reports/allure-results/` is input data for the Allure CLI. It contains machine-readable `*-result.json` files and attachments such as images, text, or video.
- `reports/allure-report/` is the rendered site. It is the directory opened by `allure:open`.

A representative result JSON includes the test name, status, timing, labels, parameters, steps, and links to attachments. Current results show Playwright lifecycle and action steps such as fixture hooks, navigation, login, and assertions.

Do not edit result JSON files by hand. They are generated output and can be regenerated from a test run.

## 5. Run Tests And View The Report

From the project root, the standard QA workflow is:

```bash
npm run test:qa
npm run allure:generate
npm run allure:open
```

What each command does:

1. `npm run test:qa` runs Playwright with `ENV=qa`. The reporter writes raw Allure data to `reports/allure-results/`.
2. `npm run allure:generate` generates the static report in `reports/allure-report/` from the raw results.
3. `npm run allure:open` opens the already-generated report in a browser.

To run a specific spec before generating the report:

```bash
npx playwright test tests/E2E/orderFlow.spec.js
npm run allure:generate
npm run allure:open
```

To serve a temporary report directly from raw results, without keeping a generated report directory:

```bash
npm run allure:serve
```

`allure:serve` starts a local server and normally remains active until stopped. Use `allure:generate` followed by `allure:open` when you want a persistent generated report directory.

The general `npm test` script clears report and test output directories before running the full suite. The environment-specific scripts such as `npm run test:qa` do not run that cleanup first, so old result files can remain in `reports/allure-results` and be included in the next generated report. The `npm run clean` script removes the whole `reports/` directory and `test-results/`; use it only when you intend to delete those generated artifacts.

## 6. Current Test Integration

The `allure-playwright` reporter is active in the framework, so it automatically records test lifecycle information and Playwright steps. The test results currently contain fixture/setup steps, Playwright actions, test names, statuses, and attachments where produced.

The helper functions in `utils/allure.js` are not currently imported by the test specs. Therefore, explicit `epic`, `feature`, `story`, owner, custom tags, descriptions, custom metadata parameters, issue links, TMS links, helper-defined steps, and helper-defined attachments will not appear just because the helper exists. Add calls to a spec when that richer organization is needed.

Playwright's own `test.step()` is already used in the login page flow and is captured in the generated result. The helper's `step()` function is an alternative wrapper around the Allure API.

## 7. Optional Allure Helper API

The helper at `utils/allure.js` dynamically imports `allure-js-commons` and exports named and default APIs. Import only what a test needs:

```js
import {
  allureMeta,
  step,
  attach,
  attachJSON,
  Severity,
  LinkType,
} from "../../utils/allure.js";
```

Use the matching relative path for the spec's location.

### Add test metadata

Call metadata from inside the running test so it applies to the current test:

```js
await allureMeta({
  epic: "Shopping",
  feature: "Checkout",
  story: "Customer completes an order",
  severity: Severity.CRITICAL,
  owner: "Automation Team",
  tags: ["smoke", "regression"],
  description: "A signed-in customer submits a valid order.",
  parameters: { environment: "qa" },
  links: [
    { name: "Checkout requirements", url: "https://example.invalid/checkout" },
  ],
  issue: { name: "BUG-123", url: "https://example.invalid/BUG-123" },
  tms: { name: "CASE-456", url: "https://example.invalid/CASE-456" },
  labels: { component: "checkout" },
});
```

Supported metadata fields are:

- `epic`, `feature`, and `story` for the behavior hierarchy.
- `severity` using the exported `Severity` values: `BLOCKER`, `CRITICAL`, `NORMAL`, `MINOR`, or `TRIVIAL`.
- `owner`, `tags`, and Markdown `description`.
- `parameters` and `labels`, whose values are converted to strings.
- `links`, `issue`, and `tms`, each containing the relevant name and URL. A general link can optionally specify `type`; otherwise the helper uses `LinkType.DEFAULT`.

The helper does not apply a default severity automatically; pass one when it is important to the report.

### Add a named step

```js
await step("Add product and open cart", async () => {
  await inventoryPage.addProductToCart("Sauce Labs Backpack");
  await inventoryPage.goToCart();
});
```

The step is shown in the current test's report as a timed, nested step. If the Allure API is unavailable, this helper calls the body directly so the test work still runs.

### Attach text, binary content, or JSON

```js
await attach("Checkout note", "Order total was verified.");
await attachJSON("Order summary", { itemCount: 1, total: "$32.39" });

const screenshot = await page.screenshot({ fullPage: true });
await attach("Checkout screenshot", screenshot, "image/png");
```

`attach(name, content, contentType)` accepts a string or `Buffer`; the default content type is `text/plain`. `attachJSON(name, object)` pretty-prints JSON and uses `application/json`.

Never attach passwords, access tokens, session cookies, or unredacted personal data. Attachments are stored with raw results and may be copied to CI artifacts or shared reports.

## 8. Fail-Safe Behavior And Limitations

The helper is intentionally optional:

- If the dynamic import of `allure-js-commons` fails, metadata and attachments become no-ops; the `step()` helper runs its body without creating an Allure step.
- `allureMeta`, `attach`, and `attachJSON` use an internal `safe()` wrapper. If the API is absent or throws, the error is swallowed so reporting does not interrupt the test.
- The current `safe()` implementation does not log caught errors. A missing metadata field may therefore be difficult to diagnose from the test output alone.
- `step()` delegates directly to `allure.step()` when the API loaded; an error from that call is not swallowed by `safe()`.
- If one metadata API call throws during `allureMeta`, the remaining metadata calls in that same invocation do not run because the wrapper catches at the outside of the full sequence.

The reporter must be enabled for helper metadata and attachments to appear in the Allure results. A valid JavaScript import alone does not guarantee an Allure test context.

## 9. Clean Results And History

For a clean full run, use the existing `npm test` script, which removes prior Allure and Playwright output before running tests. For a QA-only run, remove stale Allure results deliberately only when you no longer need them; the current QA script does not clean first.

Allure history/trend data is not automatically preserved by the current scripts. The generate script removes the old generated report, and the full test script removes old raw results. If historical trends are required in CI, preserve the previous report's `history/` data and copy it into the next raw results directory before generating the next report; configure that retention explicitly in the pipeline.

## 10. Git And CI Notes

The current `.gitignore` ignores Playwright's `test-results/`, but it does not ignore the `reports/` directory. Allure result JSON and attachments can be large and may contain sensitive test evidence. Decide whether reports should be committed; for most teams, add the appropriate report output directories to `.gitignore` and publish them as CI artifacts with controlled access instead.

A typical CI sequence is:

```bash
npm ci
npm run test:qa
npm run allure:generate
```

Preserve `reports/allure-results/` or `reports/allure-report/` as a build artifact after the run. Since a failing Playwright run usually exits non-zero, configure the CI pipeline to still run report generation and artifact upload after test failure (for example, using the pipeline's always/after-failure behavior). Do not make report generation contingent on the tests passing.

## 11. Troubleshooting

**`allure:open` says the report cannot be found.**

Run tests and then `npm run allure:generate` first. `allure:open` opens `reports/allure-report`; it does not generate it.

**The report has no tests or contains older runs.**

Check for `*-result.json` files in `reports/allure-results/`. Environment-specific scripts do not clean this directory. Use a fresh result directory or the full `npm test` script when you need an isolated run.

**The report shows status and steps but not my custom epic/story/owner.**

The reporter creates the base report automatically, but custom metadata must be passed to `allureMeta()` in the test. That helper currently has no spec call sites.

**The helper metadata call does not fail the test even though the report field is missing.**

`allureMeta`, `attach`, and `attachJSON` intentionally swallow reporter API errors. Confirm the reporter is enabled and the test is running in an Allure context. The current wrapper does not emit diagnostic logs for swallowed errors.

**The report does not include a screenshot or video.**

Check whether the Playwright run produced the artifact, whether the reporter attached it to the Allure result, and whether the result's attachment entry references a file in `reports/allure-results/`. The Playwright config only requests screenshots, traces, and videos according to its failure-retention settings.

**The report looks incomplete after a test failure.**

A test process can exit with a failure status and still have written raw results. Run report generation in a CI finally/always step and retain its output even when tests fail.

## 12. Quick Checklist

- Run tests with the root-level `allure-playwright` reporter enabled.
- Confirm raw `*-result.json` files exist in `reports/allure-results/`.
- Generate the HTML report before using `allure:open`.
- Use the shared helper for custom metadata, steps, and attachments; it is optional and currently unused by specs.
- Keep result directories fresh when combining runs is not intended.
- Do not attach secrets or sensitive user data.
- Preserve report history and CI artifacts deliberately; the current scripts do not retain trends automatically.

Allure is a test reporting tool used to convert automation execution results into an interactive and easy-to-understand report. It helps the team analyze test results, failures, execution time, steps, screenshots, videos, traces, and other attachments.
