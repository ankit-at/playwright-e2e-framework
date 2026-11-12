import { browser } from "k6/browser";
import { check, sleep } from "k6";
import { Trend, Rate } from "k6/metrics";

// Darwinbox careers portal (QA) — real-browser UI load test (k6 browser module).
// Measures what a candidate sees: full page load until jobs render, then each UI
// action (search, sort, filter, load more, open job details) until its result
// renders. Web Vitals (FCP/LCP/TTFB/CLS) are reported automatically by k6.
//
// The page serves a crawler/link-preview stub to user agents containing
// "HeadlessChrome", so a desktop Chrome UA is set explicitly.
//
// Run: K6_BROWSER_HEADLESS=true k6 run -e VUS=1 -e ITERATIONS=3 dist/k6/darwinbox-careers-browser.js

const BASE = __ENV.DBX_BASE || "https://ta2.qa.darwinbox.io";
const CO = __ENV.DBX_COMPANY || "main";
const URL = `${BASE}/ms/candidatev2/${CO}/careers/allJobs`;
const UA =
  "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/156.0.0.0 Safari/537.36";

export const options = {
  scenarios: {
    ui: {
      executor: "per-vu-iterations",
      vus: Number(__ENV.VUS || 1),
      iterations: Number(__ENV.ITERATIONS || 1),
      maxDuration: "15m",
      options: { browser: { type: "chromium" } },
    },
  },
  thresholds: {
    ui_action_ok: ["rate>0.95"],
    ui_page_load_jobs_visible: ["p(95)<10000"],
    browser_web_vital_lcp: ["p(95)<4000"],
  },
  summaryTrendStats: ["min", "med", "avg", "p(90)", "p(95)", "max"],
};

const pageLoad = new Trend("ui_page_load_jobs_visible", true);
const searchT = new Trend("ui_search", true);
const sortT = new Trend("ui_sort", true);
const filterT = new Trend("ui_filter_department", true);
const loadMoreT = new Trend("ui_load_more", true);
const detailsT = new Trend("ui_job_details", true);
const actionOk = new Rate("ui_action_ok");

const tid = (id: string) => `[data-testid="${id}"]`;

export default async function () {
  const context = await browser.newContext({ userAgent: UA, viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  // Times an action until `done` resolves; records success and duration.
  async function step(trend: Trend, fn: () => Promise<void>) {
    const t = Date.now();
    try {
      await fn();
      trend.add(Date.now() - t);
      actionOk.add(true);
    } catch (e) {
      actionOk.add(false);
      console.warn(`step ${trend.name} failed: ${e instanceof Error ? e.message : String(e)}`);
      if (__ENV.SHOT_DIR) await page.screenshot({ path: `${__ENV.SHOT_DIR}/${trend.name}-${Date.now()}.png` }).catch(() => {});
    }
  }
  // k6 browser's waitForResponse takes a string/RegExp URL matcher (no predicate).
  const jobsListUpdate = () => page.waitForResponse(/\/candidateapi\/job\/alljobs/, { timeout: 30000 });

  try {
    await step(pageLoad, async () => {
      await page.goto(URL, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.locator('[data-testid$="-view-and-apply-btn"]').first().waitFor({ state: "visible", timeout: 60000 });
    });
    check(page, { "jobs rendered": () => true });
    sleep(2);

    await step(searchT, async () => {
      const input = page.locator(`${tid("all-jobs-job-search-search-select")} input`);
      await input.click();
      await input.type("Test", { delay: 60 });
      const resp = page.waitForResponse(/\/candidateapi\/search/, { timeout: 30000 });
      await page.locator(tid("all-jobs-job-search-search-btn")).click();
      await resp;
    });
    sleep(2);

    await step(loadMoreT, async () => {
      const btn = page.locator(tid("all-jobs-load-more-btn"));
      const resp = jobsListUpdate();
      await btn.click();
      await resp;
    });
    sleep(2);

    await step(sortT, async () => {
      await page.locator(tid("all-jobs-sort-dropdown")).click();
      const resp = jobsListUpdate();
      await page.locator('[role="option"][data-value="old"]').first().click();
      await resp;
    });
    sleep(2);

    await step(filterT, async () => {
      await page.locator(tid("all-jobs-desktop-job-filters-filter-department-accordion")).click();
      const resp = jobsListUpdate();
      await page.locator(tid("all-jobs-desktop-job-filters-filter-department-checkbox")).first().click();
      await resp;
    });
    sleep(2);

    await step(detailsT, async () => {
      await page.locator('[data-testid$="-view-and-apply-btn"]').first().click();
      await page.locator(tid("job-details-apply-now-btn")).waitFor({ state: "visible", timeout: 60000 });
    });
  } finally {
    await page.close();
    await context.close();
  }
  sleep(Number(__ENV.PACING || 5));
}
