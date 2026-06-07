// @ts-check
const { ProtoCommercePage } = require("./protocommerce.page");

/**
 * LoginPage — the ProtoCommerce login form, which also hosts the practice
 * widgets (role dropdown, radio buttons, terms checkbox) and the documents link
 * that opens a child window.
 */
class LoginPage extends ProtoCommercePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.usernameInput = page.locator("#username");
    this.passwordInput = page.locator("#password");
    this.signInButton = page.locator("#signInBtn");
    // Error banner is toggled visible via inline style="display: block".
    this.errorBanner = page.locator("[style*='block']");
    this.roleDropdown = page.locator("select.form-control");
    this.okayButton = page.locator("#okayBtn");
    this.termsCheckbox = page.locator("#terms");
    // Blinking "Free Access to InterviewQues..." link — opens a child window.
    this.documentsLink = page.locator("div.float-right a").first();
  }

  async open() {
    await this.page.goto(this.baseURL);
  }

  /** A role radio button by its value, e.g. "user" / "admin". @param {string} value */
  radioByValue(value) {
    return this.page.locator(`input[value="${value}"]`);
  }

  /**
   * Fill credentials and submit. Navigation/landing assertions stay in the spec.
   * @param {string} username
   * @param {string} password
   */
  async login(username, password) {
    await this.open();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}

module.exports = { LoginPage };
