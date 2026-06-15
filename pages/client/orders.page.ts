import { ClientPage } from "./client.page";

/**
 * OrdersPage — the "My Orders" listing, including the per-order "View" action
 * used by the cross-order authorization (IDOR) check.
 */
export class OrdersPage extends ClientPage {
  readonly orderIdCells = this.page.locator('tr th[scope="row"]');
  readonly viewOrderButton = this.page.locator("button.btn.btn-primary").first();
  readonly notAuthorizedMessage = this.page.locator("p.blink_me");
  // Empty-state message shown when the orders API returns no orders.
  readonly emptyMessage = this.page.locator(".mt-4");

  /** Wait for the orders table to render its first row. */
  async waitForRows(): Promise<void> {
    await this.actions.waitFor(this.orderIdCells.first());
  }

  /** Whether the given order id appears in the orders table. */
  async hasOrder(orderId: string): Promise<boolean> {
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
