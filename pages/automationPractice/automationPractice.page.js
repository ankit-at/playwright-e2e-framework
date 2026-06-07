// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * AutomationPracticePage — the RSA "AutomationPractice" kitchen-sink page
 * (radios, autocomplete, dropdown, checkboxes, child windows, tables, alerts,
 * mouse hover, iframe). Base URL comes from config/testData.
 */
class AutomationPracticePage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.automationPractice.baseURL;
    // Radios / autocomplete / dropdown / checkboxes
    this.radioExample = page.locator("#radio-btn-example");
    this.autocompleteInput = page.locator("#autocomplete");
    this.dropdown = page.locator("#dropdown-class-example");
    // Windows / tabs
    this.openWindowButton = page.locator("#openwindow");
    this.openTabButton = page.locator("#opentab");
    // Show / hide
    this.displayedText = page.locator("#displayed-text");
    this.hideTextboxButton = page.locator("#hide-textbox");
    // Dialogs
    this.confirmButton = page.locator("#confirmbtn");
    this.alertButton = page.locator("#alertbtn");
    // Mouse hover
    this.mouseHover = page.locator("#mousehover");
    this.mouseHoverContent = page.locator(".mouse-hover-content");
  }

  async open() {
    await this.page.goto(this.baseURL);
  }

  /** Radio input whose id/value match `id` (e.g. "radio2"). @param {string} id */
  radioByValue(id) {
    return this.radioExample.locator(`label[for="${id}"] input[value="${id}"]`);
  }

  /** Checkbox input by its value, e.g. "option2". @param {string} value */
  checkboxByValue(value) {
    return this.page.locator(`label:has(input[value="${value}"]) input`);
  }

  /**
   * Type into the autocomplete and pick the suggestion matching `optionText`.
   * @param {string} typeText
   * @param {RegExp|string} optionText
   */
  async selectAutocomplete(typeText, optionText) {
    await this.autocompleteInput.pressSequentially(typeText);
    await this.page.locator(".ui-menu-item-wrapper:visible", { hasText: optionText }).click();
  }

  /**
   * Click a trigger that opens a new tab/window; return its title and close it.
   * @param {import("@playwright/test").Locator} trigger
   * @returns {Promise<string>}
   */
  async openInNewTabAndGetTitle(trigger) {
    const [newPage] = await Promise.all([this.page.context().waitForEvent("page"), trigger.click()]);
    await newPage.waitForLoadState();
    const title = await newPage.title();
    await newPage.close();
    return title;
  }

  /**
   * Scrape the nth `#product` table into objects keyed by header text.
   * @param {number} tableNumber
   * @returns {Promise<Record<string, string>[]>}
   */
  async readTable(tableNumber) {
    const table = this.page.locator("#product").nth(tableNumber);
    const rows = table.locator("tr");

    /** @type {string[]} */
    const headers = [];
    const headerCells = rows.first().locator("th");
    for (let i = 0; i < (await headerCells.count()); i++) {
      headers.push(((await headerCells.nth(i).textContent()) ?? "").trim());
    }

    /** @type {Record<string, string>[]} */
    const data = [];
    for (let i = 1; i < (await rows.count()); i++) {
      const cells = rows.nth(i).locator("td");
      /** @type {Record<string, string>} */
      const rowObject = {};
      for (let j = 0; j < (await cells.count()); j++) {
        rowObject[headers[j]] = ((await cells.nth(j).textContent()) ?? "").trim();
      }
      data.push(rowObject);
    }
    return data;
  }

  /** Hover the mouse-hover control and click a revealed link by text. @param {string} linkText */
  async clickMouseHoverLink(linkText) {
    await this.mouseHover.hover();
    await this.mouseHoverContent.waitFor();
    await this.mouseHoverContent
      .locator("a", { hasText: linkText })
      .click({ force: true });
  }

  /** @returns {import("@playwright/test").FrameLocator} the embedded courses iframe. */
  coursesFrame() {
    return this.page.frameLocator("#courses-iframe");
  }
}

module.exports = { AutomationPracticePage };
