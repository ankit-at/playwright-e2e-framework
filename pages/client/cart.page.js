// @ts-check
const { ClientPage } = require("./client.page");

/**
 * CartPage — the shopping cart listing and its checkout button.
 */
class CartPage extends ClientPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.cartProducts = page.locator("div.cartSection h3");
    this.checkoutButton = page.locator("div.cartSection.removeWrap button.btn-primary");
  }

  /** Proceed from the cart to the payment screen. */
  async checkout() {
    await this.checkoutButton.click();
  }
}

module.exports = { CartPage };
