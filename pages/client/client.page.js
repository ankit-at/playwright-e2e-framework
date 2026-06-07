// @ts-check
const { BasePage } = require("../base.page");
const testData = require("../../config/testData");

/**
 * ClientPage — base for the RSA Angular e-commerce app
 * (https://rahulshettyacademy.com/client/). Resolves the base URL from
 * config/testData and owns the persistent dashboard header (cart + my-orders nav)
 * shared across every authenticated screen.
 */
class ClientPage extends BasePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.baseURL = testData.client.baseURL;
    this.cartButton = page.locator('button[routerlink="/dashboard/cart"]');
    this.cartBadge = page.locator('button[routerlink="/dashboard/cart"] label');
    this.ordersButton = page.locator('button[routerlink="/dashboard/myorders"]');
    this.toastContainer = page.locator("#toast-container");
  }

  async open() {
    await this.page.goto(this.baseURL);
  }

  /** Click the cart button and wait for the cart route to load. */
  async goToCart() {
    await Promise.all([
      this.page.waitForURL(/cart/, { timeout: 15000 }),
      this.cartButton.click(),
    ]);
  }

  /** Navigate to the My Orders page via the header button. */
  async goToMyOrders() {
    await this.ordersButton.click();
  }
}

module.exports = { ClientPage };
