import { ClientPage } from "./client.page";

/**
 * LoginPage — the RSA client sign-in screen.
 */
export class LoginPage extends ClientPage {
  readonly emailInput = this.page.locator("#userEmail");
  readonly passwordInput = this.page.locator("#userPassword");
  readonly loginButton = this.page.locator("#login");
  readonly toastMessage = this.page.locator("div.toast-message.ng-star-inserted");

  /**
   * Fill credentials and submit. Post-login waits/assertions stay in the spec so
   * the same action serves both valid- and invalid-login tests.
   */
  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
