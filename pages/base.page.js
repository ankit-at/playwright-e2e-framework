// @ts-check

/**
 * BasePage — shared plumbing every page object inherits.
 *
 * Page objects own locators and expose intent-revealing actions. They hold NO
 * assertions: assertions live in specs, so the same page object can serve a test
 * that expects success and one that expects failure. `waitFor()` here is
 * synchronization (waiting for a state), not an assertion.
 */
class BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    this.page = page;
  }

  /** Navigate to an absolute URL. @param {string} url */
  async navigate(url) {
    await this.page.goto(url);
  }
}

module.exports = { BasePage };
