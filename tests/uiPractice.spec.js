const { test, expect } = require("@playwright/test");
const { findBrokenLinks } = require("../utils/links");
const { AutomationPracticePage } = require("../pages/automationPractice");

/** @type {import("@playwright/test").Page} */
let page;
/** @type {import("@playwright/test").BrowserContext} */
let context;
/** @type {AutomationPracticePage} */
let practice;

test.describe("Happy Flow (shared session)", () => {
  test.describe.configure({ mode: "serial" });

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext({ storageState: "auth.json" });
    page = await context.newPage();
    practice = new AutomationPracticePage(page);
    await practice.open();
  });

  test.afterAll(async () => {
    await page.close();
    await context.close();
  });

  test("should have correct title", async () => {
    // radio + autocomplete + dropdown + checkboxes + tabs + tables + link sweep
    test.setTimeout(120000);

    // Radio button
    const radio2 = practice.radioByValue("radio2");
    await radio2.check();
    await expect(radio2).toBeChecked();

    // Suggestive (autocomplete) text
    await practice.selectAutocomplete("ind", /^India$/);
    expect(await practice.autocompleteInput.inputValue()).toBe("India");

    // Dropdown
    await practice.dropdown.selectOption("option3");
    await expect(practice.dropdown).toHaveValue("option3");

    // Checkboxes
    const checkbox2 = practice.checkboxByValue("option2");
    await checkbox2.check();
    await expect(checkbox2).toBeChecked();

    const checkbox3 = practice.checkboxByValue("option3");
    await checkbox3.check();
    await expect(checkbox3).toBeChecked();

    // New window + new tab — each click opens a page; assert its title and close
    const windowTitle = await practice.openInNewTabAndGetTitle(practice.openWindowButton);
    console.log("New Window: " + windowTitle);
    expect(windowTitle).toBeTruthy();

    const tabTitle = await practice.openInNewTabAndGetTitle(practice.openTabButton);
    console.log("New Tab: " + tabTitle);
    expect(tabTitle).toBeTruthy();

    // Table scraping
    console.table(await practice.readTable(0));
    console.table(await practice.readTable(1));

    // Broken-link sweep
    const result = await findBrokenLinks(page, "a");
    console.log("Broken Links:", result.brokenLinks);
    console.log("Empty Links:", result.emptyLinks);
  });
});
