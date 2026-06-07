// Artillery + Playwright flow.
// Each Artillery virtual user runs this function with a real Playwright `page`.
// Artillery automatically records browser metrics (FCP, LCP, TTFB, step timings).
const { readProperties } = require("../utils/readProperties");

const data = readProperties("test-data/newlogin.properties");

async function loginFlow(page, vuContext, events, test) {
  const { step } = test;

  // Step timings show up as named metrics in the Artillery report.
  await step("go to login page", async () => {
    await page.goto(data.appUrl1, { waitUntil: "load" });
    await page.locator("#userEmail").waitFor();
  });

  await step("submit login", async () => {
    await page.locator("#userEmail").fill(data.validUsername1);
    await page.locator("#userPassword").fill(data.validPassword1);
    await page.locator("#login").click();
  });

  await step("land on dashboard", async () => {
    await page.locator("div.card-body h5").first().waitFor();
    // Custom counter: count successful logins.
    events.emit("counter", "login.success", 1);
  });
}

module.exports = { loginFlow };
