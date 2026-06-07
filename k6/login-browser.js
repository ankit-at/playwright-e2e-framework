import { browser } from "k6/browser";
import { check } from "k6";

// NOTE: This is k6's OWN browser module (Playwright-LIKE API), not Playwright itself.
// You write to k6's API; it drives Chromium via CDP and reports Web Vitals.
export const options = {
  scenarios: {
    ui: {
      executor: "shared-iterations",
      vus: 2,
      iterations: 4,
      options: { browser: { type: "chromium" } },
    },
  },
  thresholds: {
    browser_web_vital_fcp: ["p(95)<3500"],
    browser_web_vital_lcp: ["p(95)<4500"],
    checks: ["rate>0.99"],
  },
};

// Credentials come from env only (k6 reads -e RSA_EMAIL=... or the shell env).
const EMAIL = __ENV.RSA_EMAIL;
const PASS = __ENV.RSA_PASSWORD;

export default async function () {
  const page = await browser.newPage();
  try {
    await page.goto("https://rahulshettyacademy.com/client/", { waitUntil: "load" });
    await page.locator("#userEmail").fill(EMAIL);
    await page.locator("#userPassword").fill(PASS);
    await Promise.all([
      page.locator("#login").click(),
      page.locator("div.card-body h5").first().waitFor(),
    ]);
    const ok = await page.locator("div.card-body h5").first().isVisible();
    check(page, { "logged in (product visible)": () => ok });
  } finally {
    await page.close();
  }
}
