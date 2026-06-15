import type { Page } from "@playwright/test";

/**
 * BasePage — shared plumbing every page object inherits.
 *
 * Page objects own locators and expose intent-revealing actions. They hold NO
 * assertions: assertions live in specs, so the same page object can serve a test
 * that expects success and one that expects failure. `waitFor()` here is
 * synchronization (waiting for a state), not an assertion.
 */
export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /** Navigate to an absolute URL. */
  async navigate(url: string): Promise<void> {
    await this.page.goto(url);
  }
}
