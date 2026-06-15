import type { Page } from "@playwright/test";
import { PageActions } from "./actions";

/**
 * BasePage — shared plumbing every page object inherits.
 *
 * Exposes `this.actions` (a `PageActions` instance) so every page object can
 * call common browser interactions — fill, click, selectOption, waitFor, table
 * reading, dialog handling, new-tab handling, etc. — from a single central
 * location rather than reaching directly to the raw `this.page.*` API.
 *
 * Page objects hold NO assertions: assertions live in specs.
 */
export class BasePage {
  readonly page: Page;
  /** Central action library — call common interactions through here. */
  readonly actions: PageActions;

  constructor(page: Page) {
    this.page = page;
    this.actions = new PageActions(page);
  }

  /** Navigate to an absolute URL. */
  async navigate(url: string): Promise<void> {
    await this.actions.goto(url);
  }
}
