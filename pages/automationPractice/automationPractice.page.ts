import type { FrameLocator, Locator } from "@playwright/test";
import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * AutomationPracticePage — the RSA "AutomationPractice" kitchen-sink page
 * (radios, autocomplete, dropdown, checkboxes, child windows, tables, alerts,
 * mouse hover, iframe). Generic interactions (new-tab, table scrape, frame) are
 * delegated to the central PageActions library via `this.actions`.
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
    await this.actions.goto(this.baseURL);
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
    await this.actions.type(this.autocompleteInput, typeText);
    await this.actions.click(this.page.locator(".ui-menu-item-wrapper:visible", { hasText: optionText }));
  }

  /** Click a trigger that opens a new tab/window; return its title and close it. */
  async openInNewTabAndGetTitle(trigger: Locator): Promise<string> {
    return this.actions.openInNewTabAndGetTitle(trigger);
  }

  /** Click a trigger that opens a new tab/window; return its final URL and close it. */
  async openInNewTabAndGetUrl(trigger: Locator): Promise<string> {
    return this.actions.openInNewTabAndGetUrl(trigger);
  }

  /** Scrape the nth `#product` table into objects keyed by header text. */
  async readTable(tableNumber: number): Promise<Record<string, string>[]> {
    return this.actions.readTable(this.page.locator("#product").nth(tableNumber));
  }

  /** Hover the mouse-hover control and click a revealed link by text. */
  async clickMouseHoverLink(linkText: string): Promise<void> {
    await this.actions.hover(this.mouseHover);
    await this.actions.waitFor(this.mouseHoverContent);
    await this.actions.click(this.mouseHoverContent.locator("a", { hasText: linkText }), {
      force: true,
    });
  }

  /** The embedded courses iframe. */
  coursesFrame(): FrameLocator {
    return this.actions.getFrame("#courses-iframe");
  }
}
