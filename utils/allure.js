/**
 * Allure reporting helper.
 * ------------------------------------------------------------------
 * A thin, SAFE wrapper around the official `allure-js-commons` API.
 *
 * Why a wrapper?
 *  - Tests get ONE clean helper (`allureMeta`, `step`, `attach`) instead of
 *    calling 8-10 different allure functions in every spec.
 *  - It is FAIL-SAFE: if the Allure reporter is not active (for example when
 *    you run only the HTML reporter, or the package is missing), every call
 *    becomes a harmless no-op instead of crashing your tests.
 *
 * This is what makes the report look "real / production grade":
 *  - epic / feature / story  -> the Behaviors tree (BDD-style grouping)
 *  - severity                -> blocker / critical / normal / minor / trivial
 *  - owner + tags            -> who owns it, how to filter it
 *  - links / issue / tms     -> jump straight to Jira / TestRail / a bug
 *  - description             -> rich markdown shown on the test page
 *  - parameters              -> the exact data used (great for data-driven)
 *  - steps                   -> a readable, timed, pass/fail step tree
 *  - attachments             -> screenshots, JSON, logs, request/response
 */

// Load allure-js-commons lazily & safely so a missing/inactive reporter
// never breaks a test run.
let allure = null;
let Severity = {
  BLOCKER: "blocker",
  CRITICAL: "critical",
  NORMAL: "normal",
  MINOR: "minor",
  TRIVIAL: "trivial",
};
let LinkType = { DEFAULT: "link", ISSUE: "issue", TMS: "tms" };

try {
  const mod = await import("allure-js-commons");
  allure = mod;
  if (mod.Severity) Severity = mod.Severity;
  if (mod.LinkType) LinkType = mod.LinkType;
} catch {
  // Allure not installed / not active -> everything below no-ops.
  allure = null;
}

export { Severity, LinkType };

/** Run an allure call only if allure is active; swallow any runtime error. */
async function safe(fn) {
  if (!allure) return;
  try {
    await fn();
  } catch {
    /* reporter inactive for this run — ignore */
  }
}

/**
 * Wrap a block of actions in a named, timed Allure step.
 * Shows up as an expandable, pass/fail node in the report.
 *
 * @template T
 * @param {string} name
 * @param {() => Promise<T>} body
 * @returns {Promise<T>}
 */
export async function step(name, body) {
  if (!allure) return body();
  return allure.step(name, body);
}

/**
 * Attach any content to the current test/step (screenshot, JSON, log, text).
 * @param {string} name
 * @param {string | Buffer} content
 * @param {string} [contentType='text/plain']
 */
export async function attach(name, content, contentType = "text/plain") {
  await safe(() => allure.attachment(name, content, contentType));
}

/**
 * Attach a pretty-printed JSON object (perfect for API request/response,
 * test data, environment snapshots, etc.).
 * @param {string} name
 * @param {unknown} obj
 */
export async function attachJSON(name, obj) {
  await safe(() =>
    allure.attachment(name, JSON.stringify(obj, null, 2), "application/json"),
  );
}

/**
 * Apply a full set of Allure metadata to the CURRENT test in one call.
 *
 * @param {object} meta
 * @param {string}   [meta.epic]        High-level product area (top of tree)
 * @param {string}   [meta.feature]     Feature under the epic
 * @param {string}   [meta.story]       User story under the feature
 * @param {string}   [meta.severity]    One of Severity.* (default: normal)
 * @param {string}   [meta.owner]       Person/team responsible
 * @param {string[]} [meta.tags]        Tags (smoke, regression, ...)
 * @param {string}   [meta.description] Markdown description
 * @param {object}   [meta.parameters]  Key/value params (data-driven inputs)
 * @param {Array<{name:string,url:string,type?:string}>} [meta.links] Extra links
 * @param {{name:string,url:string}} [meta.issue] Bug tracker link (Jira)
 * @param {{name:string,url:string}} [meta.tms]   Test management link (TestRail)
 * @param {Record<string,string>}    [meta.labels] Any extra custom labels
 */
export async function allureMeta(meta = {}) {
  if (!allure) return;

  await safe(async () => {
    if (meta.epic) await allure.epic(meta.epic);
    if (meta.feature) await allure.feature(meta.feature);
    if (meta.story) await allure.story(meta.story);
    if (meta.severity) await allure.severity(meta.severity);
    if (meta.owner) await allure.owner(meta.owner);

    if (Array.isArray(meta.tags)) {
      for (const tag of meta.tags) await allure.tag(tag);
    }

    if (meta.description) await allure.description(meta.description);

    if (meta.parameters && typeof meta.parameters === "object") {
      for (const [key, value] of Object.entries(meta.parameters)) {
        await allure.parameter(key, String(value));
      }
    }

    if (meta.labels && typeof meta.labels === "object") {
      for (const [key, value] of Object.entries(meta.labels)) {
        await allure.label(key, String(value));
      }
    }

    if (Array.isArray(meta.links)) {
      for (const l of meta.links)
        await allure.link(l.url, l.name, l.type || LinkType.DEFAULT);
    }

    if (meta.issue) await allure.issue(meta.issue.name, meta.issue.url);
    if (meta.tms) await allure.tms(meta.tms.name, meta.tms.url);
  });
}

export default { allureMeta, step, attach, attachJSON, Severity, LinkType };
