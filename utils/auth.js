// @ts-check
const fs = require("node:fs");
const path = require("node:path");
const { LoginPage } = require("../pages/eventhub/login.page");
const testData = require("../config/testData");

/** @typedef {import("@playwright/test").Page} Page */

/**
 * Log in to EventHub through the UI as the default account (from testData).
 * @param {Page} page
 */
async function loginToEventHub(page) {
  const loginPage = new LoginPage(page);
  const { email, password } = testData.eventhub.credentials;
  await loginPage.login(email, password);
}

/**
 * Per-worker storageState seeding for the EventHub app: log in once per worker
 * via the UI and reuse the saved session for every later test on that worker.
 * Pattern: https://playwright.dev/docs/auth#moderate-one-account-per-parallel-worker
 *
 * @param {import("@playwright/test").Browser} browser
 * @param {import("@playwright/test").TestInfo} testInfo
 * @returns {Promise<string>} path to the saved storageState file
 */
async function seedEventHubStorageState(browser, testInfo) {
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

module.exports = { loginToEventHub, seedEventHubStorageState };
