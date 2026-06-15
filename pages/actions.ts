import type { Locator, Page, FrameLocator, Download } from "@playwright/test";

/**
 * PageActions — a central library of generic browser interactions that every
 * page object can call via `this.actions.*`.  Keeps the raw `page.*` API in
 * one place so page objects stay thin and readable.
 *
 * Grouped sections:
 *   navigation  – goto, waitForURL, waitForLoadState
 *   form        – fill, click, selectOption, check, uncheck, pressSequentially
 *   wait        – waitForLocator, waitForElement
 *   text        – getText, getInputValue
 *   dialog      – acceptDialog, dismissDialog
 *   tab/window  – openInNewTabAndGetTitle
 *   table       – readTable
 *   file        – download, upload
 *   frame       – getFrame
 */
export class PageActions {
  constructor(private readonly page: Page) {}

  // ── Navigation ──────────────────────────────────────────────────────────────

  /** Navigate to an absolute URL. */
  async goto(url: string, options?: Parameters<Page["goto"]>[1]): Promise<void> {
    await this.page.goto(url, options);
  }

  /** Wait until the current URL matches `pattern`. */
  async waitForURL(pattern: string | RegExp, options?: { timeout?: number }): Promise<void> {
    await this.page.waitForURL(pattern, options);
  }

  /** Wait for a specific load state. */
  async waitForLoadState(state?: "load" | "domcontentloaded" | "networkidle"): Promise<void> {
    await this.page.waitForLoadState(state);
  }

  // ── Form ────────────────────────────────────────────────────────────────────

  /** Fill a locator with a value. */
  async fill(locator: Locator, value: string): Promise<void> {
    await locator.fill(value);
  }

  /** Type character-by-character (triggers `input` events per character). */
  async type(locator: Locator, text: string): Promise<void> {
    await locator.pressSequentially(text);
  }

  /** Click a locator. */
  async click(locator: Locator, options?: Parameters<Locator["click"]>[0]): Promise<void> {
    await locator.click(options);
  }

  /** Select an option by value, label, or index. */
  async selectOption(locator: Locator, value: string): Promise<void> {
    await locator.selectOption(value);
  }

  /** Check a checkbox or radio. */
  async check(locator: Locator): Promise<void> {
    await locator.check();
  }

  /** Uncheck a checkbox. */
  async uncheck(locator: Locator): Promise<void> {
    await locator.uncheck();
  }

  /** Hover over an element. */
  async hover(locator: Locator): Promise<void> {
    await locator.hover();
  }

  /** Set one or more files on an input[type=file]. */
  async setInputFiles(locator: Locator, filePath: string): Promise<void> {
    await locator.setInputFiles(filePath);
  }

  /** Inject a value into localStorage before the page loads. */
  async seedLocalStorage(key: string, value: string): Promise<void> {
    await this.page.addInitScript((args) => {
      globalThis.localStorage.setItem(args[0], args[1]);
    }, [key, value]);
  }

  // ── Wait ────────────────────────────────────────────────────────────────────

  /** Wait until a locator is in the given state (default: visible). */
  async waitFor(
    locator: Locator,
    options?: Parameters<Locator["waitFor"]>[0],
  ): Promise<void> {
    await locator.waitFor(options);
  }

  /** Wait for a network response matching a URL glob/pattern. */
  async waitForResponse(url: string | RegExp): Promise<void> {
    await this.page.waitForResponse(url);
  }

  // ── Text ────────────────────────────────────────────────────────────────────

  /** Return the trimmed `innerText` of a locator. */
  async getText(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }

  /** Return the current value of an input. */
  async getInputValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  // ── Dialog ──────────────────────────────────────────────────────────────────

  /**
   * Register a one-shot dialog handler that accepts the next dialog and calls
   * `onDialog` with the dialog's message.
   */
  onNextDialog(
    action: "accept" | "dismiss",
    onMessage?: (msg: string) => void,
  ): void {
    this.page.once("dialog", async (dialog) => {
      if (onMessage) onMessage(dialog.message());
      if (action === "accept") await dialog.accept();
      else await dialog.dismiss();
    });
  }

  // ── Tab / Window ────────────────────────────────────────────────────────────

  /**
   * Click `trigger`, wait for the new tab/window it opens, then return its
   * title and close the tab.
   */
  async openInNewTabAndGetTitle(trigger: Locator): Promise<string> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      trigger.click(),
    ]);
    await newPage.waitForLoadState();
    const title = await newPage.title();
    await newPage.close();
    return title;
  }

  /**
   * Click `trigger`, wait for the new tab/window it opens, extract a value
   * from it using `extract`, then close the tab and bring the opener to front.
   */
  async openInNewTabAndExtract(
    trigger: Locator,
    extract: (newPage: Page) => Promise<string>,
  ): Promise<string> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent("page"),
      trigger.click(),
    ]);
    await newPage.waitForLoadState();
    const value = await extract(newPage);
    await newPage.close();
    await this.page.bringToFront();
    return value;
  }

  // ── Table ───────────────────────────────────────────────────────────────────

  /**
   * Scrape an HTML table into an array of objects keyed by header text.
   * @param tableLocator the `<table>` (or equivalent) to read
   * @param headerRowSelector locator for the header row within the table
   * @param headerCellSelector locator for header cells within the header row
   * @param dataRowSelector locator for data rows within the table
   * @param cellSelector locator for cells within each data row
   */
  async readTable(
    tableLocator: Locator,
    headerCellSelector = "th",
    dataRowSelector = "tr",
    cellSelector = "td",
  ): Promise<Record<string, string>[]> {
    const rows = tableLocator.locator("tr");

    const headers: string[] = [];
    const headerCells = rows.first().locator(headerCellSelector);
    for (let i = 0; i < (await headerCells.count()); i++) {
      headers.push(((await headerCells.nth(i).textContent()) ?? "").trim());
    }

    const data: Record<string, string>[] = [];
    const rowCount = await rows.count();
    for (let i = 1; i < rowCount; i++) {
      const cells = rows.nth(i).locator(cellSelector);
      const rowObj: Record<string, string> = {};
      for (let j = 0; j < (await cells.count()); j++) {
        rowObj[headers[j]] = ((await cells.nth(j).textContent()) ?? "").trim();
      }
      data.push(rowObj);
    }
    return data;
  }

  // ── File / Download ─────────────────────────────────────────────────────────

  /**
   * Arm the download listener then click `trigger`; returns the Download
   * object once the browser finishes writing it.
   */
  async download(trigger: Locator): Promise<Download> {
    const downloadPromise = this.page.waitForEvent("download");
    await trigger.click();
    return downloadPromise;
  }

  // ── Frame ───────────────────────────────────────────────────────────────────

  /** Return a FrameLocator for an iframe matched by `selector`. */
  getFrame(selector: string): FrameLocator {
    return this.page.frameLocator(selector);
  }
}
