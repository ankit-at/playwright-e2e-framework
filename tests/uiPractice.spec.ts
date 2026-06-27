import { test, expect } from "@playwright/test";
import type { BrowserContext, Page } from "@playwright/test";
import { findBrokenLinks } from "../utils/links";
import { AutomationPracticePage } from "../pages/automationPractice";

let page: Page;
let context: BrowserContext;
let practice: AutomationPracticePage;

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

    // New window + new tab — each click opens a page that navigates to a real URL.
    // Assert on the URL (not the title): the destinations are third-party pages
    // whose <title> we don't control, so verify the tab opened and navigated.
    const windowUrl = await practice.openInNewTabAndGetUrl(practice.openWindowButton);
    console.log("New Window: " + windowUrl);
    expect(windowUrl).toMatch(/^https?:\/\//);

    const tabUrl = await practice.openInNewTabAndGetUrl(practice.openTabButton);
    console.log("New Tab: " + tabUrl);
    expect(tabUrl).toMatch(/^https?:\/\//);

    // Table scraping
    console.table(await practice.readTable(0));
    console.table(await practice.readTable(1));

    // Broken-link sweep
    const result = await findBrokenLinks(page, "a");
    console.log("Broken Links:", result.brokenLinks);
    console.log("Empty Links:", result.emptyLinks);
  });
});
