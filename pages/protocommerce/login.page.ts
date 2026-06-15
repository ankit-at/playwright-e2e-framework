import type { Locator } from "@playwright/test";
import { ProtoCommercePage } from "./protocommerce.page";

/**
 * LoginPage — the ProtoCommerce login form, which also hosts the practice
 * widgets (role dropdown, radio buttons, terms checkbox) and the documents link
 * that opens a child window.
 */
export class LoginPage extends ProtoCommercePage {
  readonly usernameInput = this.page.locator("#username");
  readonly passwordInput = this.page.locator("#password");
  readonly signInButton = this.page.locator("#signInBtn");
  // Error banner is toggled visible via inline style="display: block".
  readonly errorBanner = this.page.locator("[style*='block']");
  readonly roleDropdown = this.page.locator("select.form-control");
  readonly okayButton = this.page.locator("#okayBtn");
  readonly termsCheckbox = this.page.locator("#terms");
  // Blinking "Free Access to InterviewQues..." link — opens a child window.
  readonly documentsLink = this.page.locator("div.float-right a").first();

  async open(): Promise<void> {
    await this.page.goto(this.baseURL);
  }

  /** A role radio button by its value, e.g. "user" / "admin". */
  radioByValue(value: string): Locator {
    return this.page.locator(`input[value="${value}"]`);
  }

  /** Fill credentials and submit. Navigation/landing assertions stay in the spec. */
  async login(username: string, password: string): Promise<void> {
    await this.open();
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }
}
