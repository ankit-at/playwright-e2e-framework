// Artillery + Playwright flow for the Darwinbox careers portal (QA).
// Each virtual user drives a real Chromium through one candidate journey; each
// `step` becomes a named timing metric in the Artillery report.
import type { Page } from "@playwright/test";

type ArtilleryEvents = { emit: (type: string, ...args: unknown[]) => void };
type ArtilleryTest = { step: (name: string, fn: () => Promise<void>) => Promise<void> };

const BASE = process.env.DBX_BASE || "https://ta2.qa.darwinbox.io";
const CO = process.env.DBX_COMPANY || "main";
const tid = (id: string) => `[data-testid="${id}"]`;
const jobsList = (page: Page) =>
  page.waitForResponse((r) => r.url().includes("/candidateapi/job/alljobs"), { timeout: 30000 });

export async function careersJourney(
  page: Page,
  _vuContext: unknown,
  events: ArtilleryEvents,
  test: ArtilleryTest,
): Promise<void> {
  const { step } = test;

  await step("page_load_jobs_visible", async () => {
    await page.goto(`${BASE}/ms/candidatev2/${CO}/careers/allJobs`, { waitUntil: "domcontentloaded", timeout: 60000 });
    await page.locator('[data-testid$="-view-and-apply-btn"]').first().waitFor({ timeout: 60000 });
  });

  await step("search", async () => {
    const input = page.locator(`${tid("all-jobs-job-search-search-select")} input`);
    await input.click();
    await input.pressSequentially("Test", { delay: 60 });
    const resp = page.waitForResponse((r) => r.url().includes("/candidateapi/search"), { timeout: 30000 });
    await page.locator(tid("all-jobs-job-search-search-btn")).click();
    await resp;
  });

  await step("load_more", async () => {
    const resp = jobsList(page);
    await page.locator(tid("all-jobs-load-more-btn")).click();
    await resp;
  });

  await step("sort_oldest_first", async () => {
    await page.locator(tid("all-jobs-sort-dropdown")).click();
    const resp = jobsList(page);
    await page.locator('[role="option"][data-value="old"]').first().click();
    await resp;
  });

  await step("filter_department", async () => {
    await page.locator(tid("all-jobs-desktop-job-filters-filter-department-accordion")).click();
    const resp = jobsList(page);
    await page.locator(tid("all-jobs-desktop-job-filters-filter-department-checkbox")).first().click();
    await resp;
  });

  await step("job_details", async () => {
    await page.locator('[data-testid$="-view-and-apply-btn"]').first().click();
    await page.locator(tid("job-details-apply-now-btn")).waitFor({ timeout: 60000 });
  });

  events.emit("counter", "careers.journey_completed", 1);
}
