import { EventHubPage } from "./eventhub.page";

/**
 * LoginPage — the EventHub sign-in screen (`/login`).
 */
export class LoginPage extends EventHubPage {
  readonly emailInput = this.page.getByPlaceholder("you@email.com");
  readonly passwordInput = this.page.getByLabel("Password");
  readonly loginButton = this.page.locator("#login-btn");
  // Only rendered once authenticated — the post-login signal and a useful
  // assertion target for specs.
  readonly browseEventsLink = this.page.getByRole("link", { name: "Browse Events →" });

  async open(): Promise<void> {
    await this.page.goto(`${this.baseURL}/login`);
  }

  /**
   * Drive the login form, then gate on the post-login link so the session is
   * established before the action returns.
   */
  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
    await this.browseEventsLink.waitFor();
  }
}
