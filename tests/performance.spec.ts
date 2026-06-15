import { test, expect } from "@playwright/test";
import type { Browser, Page } from "@playwright/test";
import testData from "../config/testData";
import { summarize, writeJson, appendTrendCsv } from "../utils/perf";
import { LoginPage, DashboardPage } from "../pages/client";

/**
 * Browser performance benchmark for the /client login flow.
 *
 * - Measures real, browser-rendered timings (Navigation Timing, Paint Timing,
 *   plus Core Web Vitals: LCP and a TBT approximation from long tasks).
 * - Repeats the full flow PERF_RUNS times (fresh context each) and reports
 *   median (p50) and p95 — a single run is not statistically meaningful.
 * - Exports per-run detail (JSON) and appends a trend row (CSV).
 *
 * Run:  PERF_RUNS=5 npx playwright test tests/performance.spec.ts --reporter=line
 */

const client = testData.client;
const RUNS = Number(process.env.PERF_RUNS || 5);

// Performance budgets (ms), asserted against the MEDIAN. Tune to your SLA.
const BUDGET = {
  loadComplete: 6000,
  fcp: 3500,
  lcp: 6000,
  tbt: 600,
  loginToLanding: 9000,
  productsApi: 4000,
};

const METRIC_KEYS = [
  "ttfb",
  "domContentLoaded",
  "loadComplete",
  "fcp",
  "lcp",
  "tbt",
  "loginToLanding",
  "productsApi",
];

// Navigation + Paint timing for the currently loaded document.
async function getNavTimings(page: Page) {
  return page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
    const fcp = performance
      .getEntriesByType("paint")
      .find((p) => p.name === "first-contentful-paint");
    return {
      ttfb: Math.round(nav.responseStart),
      domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
      loadComplete: Math.round(nav.loadEventEnd),
      fcp: fcp ? Math.round(fcp.startTime) : null,
    };
  });
}

// Core Web Vitals: Largest Contentful Paint + Total Blocking Time (long-task sum).
async function getWebVitals(page: Page) {
  return page.evaluate(
    () =>
      new Promise<{ lcp: number; tbt: number }>((resolve) => {
        let lcp = 0;
        let tbt = 0;
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) lcp = e.startTime;
        }).observe({ type: "largest-contentful-paint", buffered: true });
        new PerformanceObserver((l) => {
          for (const e of l.getEntries()) if (e.duration > 50) tbt += e.duration - 50;
        }).observe({ type: "longtask", buffered: true });
        setTimeout(() => resolve({ lcp: Math.round(lcp), tbt: Math.round(tbt) }), 600);
      }),
  );
}

// One full login-flow iteration in a clean session; returns a metric object.
async function runIteration(browser: Browser): Promise<Record<string, number | null>> {
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  const loginPage = new LoginPage(page);
  const dashboard = new DashboardPage(page);
  try {
    await page.goto(client.baseURL, { waitUntil: "load" });
    await loginPage.emailInput.waitFor();

    const nav = await getNavTimings(page);
    const vitals = await getWebVitals(page);

    await loginPage.emailInput.fill(client.credentials.email);
    await loginPage.passwordInput.fill(client.credentials.password);

    const start = Date.now();
    await loginPage.loginButton.click();
    await dashboard.firstProductTitle().waitFor();
    const loginToLanding = Date.now() - start;

    await expect(page).toHaveURL(/dashboard/);
    await expect(dashboard.firstProductTitle()).toHaveText(client.productName);

    const productsApi = await page.evaluate(() => {
      const r = performance
        .getEntriesByType("resource")
        .find((e) => e.name.includes("get-all-products"));
      return r ? Math.round(r.duration) : null;
    });

    return { ...nav, ...vitals, loginToLanding, productsApi };
  } finally {
    await context.close();
  }
}

test("Login flow performance benchmark", async ({ browser }) => {
  test.setTimeout(RUNS * 45_000);

  const samples: Array<Record<string, number | null>> = [];
  for (let i = 0; i < RUNS; i++) {
    const m = await runIteration(browser);
    samples.push(m);
    console.log(`  run ${i + 1}/${RUNS}:`, JSON.stringify(m));
  }

  const stats = summarize(samples, METRIC_KEYS);

  // Pretty table to console.
  console.log("\n  ===== PERFORMANCE SUMMARY (" + RUNS + " runs) =====");
  console.log(
    "  " +
      "metric".padEnd(18) +
      "p50".padStart(8) +
      "p95".padStart(8) +
      "min".padStart(8) +
      "max".padStart(8),
  );
  for (const k of METRIC_KEYS) {
    const s = stats[k];
    console.log(
      "  " +
        k.padEnd(18) +
        String(s.p50).padStart(8) +
        String(s.p95).padStart(8) +
        String(s.min).padStart(8) +
        String(s.max).padStart(8) +
        " ms",
    );
  }

  // Export per-run detail (JSON) + append trend row (CSV).
  const ts = new Date().toISOString();
  writeJson(`results/perf-detail-${ts.replace(/[:.]/g, "-")}.json`, {
    ts,
    runs: RUNS,
    samples,
    stats,
  });

  const trendRow: Record<string, string | number | null> = { timestamp: ts, runs: RUNS };
  for (const k of METRIC_KEYS) {
    trendRow[`${k}_p50`] = stats[k].p50;
    trendRow[`${k}_p95`] = stats[k].p95;
  }
  appendTrendCsv("results/perf-trend.csv", trendRow);
  console.log("\n  Exported: results/perf-trend.csv  +  results/perf-detail-*.json");

  // Attach metrics to the Playwright HTML report.
  for (const k of METRIC_KEYS) {
    test.info().annotations.push({
      type: `perf:${k}`,
      description: `p50 ${stats[k].p50}ms / p95 ${stats[k].p95}ms`,
    });
  }

  // Assert MEDIAN against budgets (stable; one slow run won't fail the gate).
  expect(stats.loadComplete.p50, "median login page load").toBeLessThan(BUDGET.loadComplete);
  expect(stats.fcp.p50, "median FCP").toBeLessThan(BUDGET.fcp);
  if (stats.lcp.p50 != null) expect(stats.lcp.p50, "median LCP").toBeLessThan(BUDGET.lcp);
  expect(stats.tbt.p50, "median TBT").toBeLessThan(BUDGET.tbt);
  expect(stats.loginToLanding.p50, "median login->landing").toBeLessThan(BUDGET.loginToLanding);
  if (stats.productsApi.p50 != null)
    expect(stats.productsApi.p50, "median products API").toBeLessThan(BUDGET.productsApi);
});
