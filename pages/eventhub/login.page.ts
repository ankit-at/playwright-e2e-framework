import { EventHubPage } from "./eventhub.page";

/**
 * LoginPage — the EventHub sign-in screen (`/login`).
 */
export class LoginPage extends EventHubPage {
  readonly emailInput = this.page.getByPlaceholder("you@email.com");
  readonly passwordInput = this.page.getByLabel("Password");
  readonly loginButton = this.page.locator("#login-btn");
  readonly browseEventsLink = this.page.getByRole("link", { name: "Browse Events →" });

  async open(): Promise<void> {
    await this.actions.goto(`${this.baseURL}/login`);
  }

  async login(email: string, password: string): Promise<void> {
    await this.open();
    await this.actions.fill(this.emailInput, email);
    await this.actions.fill(this.passwordInput, password);
    await this.actions.click(this.loginButton);
    await this.actions.waitFor(this.browseEventsLink);
  }
}
