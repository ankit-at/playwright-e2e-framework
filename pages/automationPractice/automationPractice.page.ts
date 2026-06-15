import type { FrameLocator, Locator } from "@playwright/test";
import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * AutomationPracticePage — the RSA "AutomationPractice" kitchen-sink page
 * (radios, autocomplete, dropdown, checkboxes, child windows, tables, alerts,
 * mouse hover, iframe). Base URL comes from config/testData.
 */
export class AutomationPracticePage extends BasePage {
  readonly baseURL = testData.automationPractice.baseURL;
  // Radios / autocomplete / dropdown / checkboxes
  readonly radioExample = this.page.locator("#radio-btn-example");
  readonly autocompleteInput = this.page.locator("#autocomplete");
  readonly dropdown = this.page.locator("#dropdown-class-example");
  // Windows / tabs
  readonly openWindowButton = this.page.locator("#openwindow");
  readonly openTabButton = this.page.locator("#opentab");
  // Show / hide
  readonly displayedText = this.page.locator("#displayed-text");
  readonly hideTextboxButton = this.page.locator("#hide-textbox");
  // Dialogs
  readonly confirmButton = this.page.locator("#confirmbtn");
  readonly alertButton = this.page.locator("#alertbtn");
  // Mouse hover
  readonly mouseHover = this.page.locator("#mousehover");
  readonly mouseHoverContent = this.page.locator(".mouse-hover-content");

  async open(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  /** Radio input whose id/value match `id` (e.g. "radio2"). */
  radioByValue(id: string): Locator {
    return this.radioExample.locator(`label[for="${id}"] input[value="${id}"]`);
  }

  /** Checkbox input by its value, e.g. "option2". */
  checkboxByValue(value: string): Locator {
    return this.page.locator(`label:has(input[value="${value}"]) input`);
  }

  /** Type into the autocomplete and pick the suggestion matching `optionText`. */
  async selectAutocomplete(typeText: string, optionText: RegExp | string): Promise<void> {
    await this.autocompleteInput.pressSequentially(typeText);
    await this.page.locator(".ui-menu-item-wrapper:visible", { hasText: optionText }).click();
  }

  /** Click a trigger that opens a new tab/window; return its title and close it. */
  async openInNewTabAndGetTitle(trigger: Locator): Promise<string> {
    const [newPage] = await Promise.all([this.page.context().waitForEvent("page"), trigger.click()]);
    await newPage.waitForLoadState();
    const title = await newPage.title();
    await newPage.close();
    return title;
  }

  /** Scrape the nth `#product` table into objects keyed by header text. */
  async readTable(tableNumber: number): Promise<Record<string, string>[]> {
    const table = this.page.locator("#product").nth(tableNumber);
    const rows = table.locator("tr");

    const headers: string[] = [];
    const headerCells = rows.first().locator("th");
    for (let i = 0; i < (await headerCells.count()); i++) {
      headers.push(((await headerCells.nth(i).textContent()) ?? "").trim());
    }

    const data: Record<string, string>[] = [];
    for (let i = 1; i < (await rows.count()); i++) {
      const cells = rows.nth(i).locator("td");
      const rowObject: Record<string, string> = {};
      for (let j = 0; j < (await cells.count()); j++) {
        rowObject[headers[j]] = ((await cells.nth(j).textContent()) ?? "").trim();
      }
      data.push(rowObject);
    }
    return data;
  }

  /** Hover the mouse-hover control and click a revealed link by text. */
  async clickMouseHoverLink(linkText: string): Promise<void> {
    await this.mouseHover.hover();
    await this.mouseHoverContent.waitFor();
    await this.mouseHoverContent.locator("a", { hasText: linkText }).click({ force: true });
  }

  /** The embedded courses iframe. */
  coursesFrame(): FrameLocator {
    return this.page.frameLocator("#courses-iframe");
  }
}
