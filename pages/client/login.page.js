// @ts-check
const { ClientPage } = require("./client.page");

/**
 * LoginPage — the RSA client sign-in screen.
 */
class LoginPage extends ClientPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.emailInput = page.locator("#userEmail");
    this.passwordInput = page.locator("#userPassword");
    this.loginButton = page.locator("#login");
    this.toastMessage = page.locator("div.toast-message.ng-star-inserted");
  }

  /**
   * Fill credentials and submit. Post-login waits/assertions stay in the spec so
   * the same action serves both valid- and invalid-login tests.
   * @param {string} email
   * @param {string} password
   */
  async login(email, password) {
    await this.open();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}

module.exports = { LoginPage };
