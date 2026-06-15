import { ClientPage } from "./client.page";

/**
 * CartPage — the shopping cart listing and its checkout button.
 */
export class CartPage extends ClientPage {
  readonly cartProducts = this.page.locator("div.cartSection h3");
  readonly checkoutButton = this.page.locator("div.cartSection.removeWrap button.btn-primary");

  /** Proceed from the cart to the payment screen. */
  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
