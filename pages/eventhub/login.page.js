// @ts-check
const { EventHubPage } = require("./eventhub.page");

/**
 * LoginPage — the EventHub sign-in screen (`/login`).
 * Locators demonstrate the recommended priority: placeholder, label, then id.
 */
class LoginPage extends EventHubPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.emailInput = page.getByPlaceholder("you@email.com");
    this.passwordInput = page.getByLabel("Password");
    this.loginButton = page.locator("#login-btn");
    // Only rendered once authenticated — the post-login signal and a useful
    // assertion target for specs.
    this.browseEventsLink = page.getByRole("link", { name: "Browse Events →" });
  }

  async open() {
    await this.page.goto(`${this.baseURL}/login`);
  }

  /**
   * Drive the login form, then gate on the post-login link so the session is
   * established before the action returns.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.open();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.browseEventsLink.waitFor();
  }
}

module.exports = { LoginPage };
