import { defineConfig } from "@playwright/test";
import path from "node:path";
import dotenv from "dotenv";

/**
 * Load credentials/config from a local, gitignored .env file.
 * In CI the variables are provided as GitHub Actions / Jenkins secrets instead, so
 * the missing .env is fine there. See .env.example for the required variables.
 */
dotenv.config({ path: path.resolve(__dirname, ".env") });

/**
 * @see https://playwright.dev/docs/test-configuration
 */
export default defineConfig({
  testDir: "./tests",

  // Prevents a stray test.only from silently disabling the entire suite on CI
  forbidOnly: !!process.env.CI,

  // Live third-party sites (EventHub, RSA) can be slow — absorb transient failures
  retries: process.env.CI ? 3 : 0,

  // GitHub-hosted runners have 2 vCPUs — 5 workers causes CPU thrash, login
  // timeouts, and cascading "Target page closed" errors on serial suite retries
  workers: process.env.CI ? 2 : undefined,

  timeout: 30 * 1000,
  expect: { timeout: 30 * 1000 },

  reporter: process.env.CI
    ? [
        ["list"],
        ["html", { open: "never" }],
        ["allure-playwright"],
        ["junit", { outputFile: "results/junit.xml" }],
      ]
    : [["list"], ["html", { open: "never" }], ["allure-playwright"]],

  use: {
    // EventHub locates many controls by data-testid — make getByTestId target it.
    testIdAttribute: "data-testid",
    navigationTimeout: 60000, // rahulshettyacademy.com can be slow on CI runners
    headless: true,
    // Traces/screenshots capture login request bodies, bearer tokens and filled-in
    // password fields. This repo is PUBLIC and its CI artifacts are downloadable by
    // anyone, so we never generate them on CI (even a flaky-then-passed test would
    // otherwise embed a trace into the uploaded report). Locally they stay on for
    // debugging. To debug a CI failure, reproduce locally or make the repo private.
    screenshot: process.env.CI ? "off" : "only-on-failure",
    trace: process.env.CI ? "off" : "on-first-retry",
  },

  // Single Chromium project. The apps under test are third-party live sites, so we
  // deliberately don't fan out across browsers (cost + flakiness); this explicit
  // project keeps `--project=chromium` working and leaves room to add more later.
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
