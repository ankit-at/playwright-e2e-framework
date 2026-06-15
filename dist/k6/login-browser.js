// k6/login-browser.ts
import { browser } from "k6/browser";
import { check } from "k6";
var options = {
  scenarios: {
    ui: {
      executor: "shared-iterations",
      vus: 2,
      iterations: 4,
      options: { browser: { type: "chromium" } }
    }
  },
  thresholds: {
    browser_web_vital_fcp: ["p(95)<3500"],
    browser_web_vital_lcp: ["p(95)<4500"],
    checks: ["rate>0.99"]
  }
};
var EMAIL = __ENV.RSA_EMAIL;
var PASS = __ENV.RSA_PASSWORD;
async function login_browser_default() {
  const page = await browser.newPage();
  try {
    await page.goto("https://rahulshettyacademy.com/client/", { waitUntil: "load" });
    await page.locator("#userEmail").fill(EMAIL);
    await page.locator("#userPassword").fill(PASS);
    await Promise.all([
      page.locator("#login").click(),
      page.locator("div.card-body h5").first().waitFor()
    ]);
    const ok = await page.locator("div.card-body h5").first().isVisible();
    check(page, { "logged in (product visible)": () => ok });
  } finally {
    await page.close();
  }
}
export {
  login_browser_default as default,
  options
};
