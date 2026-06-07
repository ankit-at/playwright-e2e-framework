// @ts-check
const { ClientPage } = require("./client.page");

/**
 * OrdersPage — the "My Orders" listing, including the per-order "View" action
 * used by the cross-order authorization (IDOR) check.
 */
class OrdersPage extends ClientPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.orderIdCells = page.locator('tr th[scope="row"]');
    this.viewOrderButton = page.locator("button.btn.btn-primary").first();
    this.notAuthorizedMessage = page.locator("p.blink_me");
    // Empty-state message shown when the orders API returns no orders.
    this.emptyMessage = page.locator(".mt-4");
  }

  /** Wait for the orders table to render its first row. */
  async waitForRows() {
    await this.orderIdCells.first().waitFor();
  }

  /**
   * Whether the given order id appears in the orders table.
   * @param {string} orderId
   * @returns {Promise<boolean>}
   */
  async hasOrder(orderId) {
    const count = await this.orderIdCells.count();
    for (let i = 0; i < count; i++) {
      const id = await this.orderIdCells.nth(i).textContent();
      if (id?.trim() === orderId) {
        return true;
      }
    }
    return false;
  }
}

module.exports = { OrdersPage };
