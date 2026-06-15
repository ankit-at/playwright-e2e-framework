import fs from "node:fs";
import path from "node:path";
import type { Browser, Page, TestInfo } from "@playwright/test";
import { LoginPage } from "../pages/eventhub/login.page";
import testData from "../config/testData";

/**
 * Log in to EventHub through the UI as the default account (from testData).
 */
export async function loginToEventHub(page: Page): Promise<void> {
  const loginPage = new LoginPage(page);
  const { email, password } = testData.eventhub.credentials;
  await loginPage.login(email, password);
}

/**
 * Per-worker storageState seeding for the EventHub app: log in once per worker
 * via the UI and reuse the saved session for every later test on that worker.
 * Pattern: https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
 *
 * @returns path to the saved storageState file
 */
export async function seedEventHubStorageState(
  browser: Browser,
  testInfo: TestInfo,
): Promise<string> {
  const id = testInfo.parallelIndex;
  const fileName = path.resolve(testInfo.project.outputDir, `.auth/events-${id}.json`);

  // Reuse the session if this worker already logged in.
  if (fs.existsSync(fileName)) {
    return fileName;
  }

  // First test on this worker: perform the one and only UI login.
  const context = await browser.newContext({ storageState: undefined });
  const page = await context.newPage();
  console.log(`[auth] Logging in to EventHub (worker ${id})…`);
  await loginToEventHub(page);
  await context.storageState({ path: fileName });
  await context.close();

  return fileName;
}
