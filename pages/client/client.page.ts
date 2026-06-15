import { BasePage } from "../base.page";
import testData from "../../config/testData";

/**
 * ClientPage — base for the RSA Angular e-commerce app
 * (https://rahulshettyacademy.com/client/). Resolves the base URL from
 * config/testData and owns the persistent dashboard header (cart + my-orders nav)
 * shared across every authenticated screen.
 */
export class ClientPage extends BasePage {
  readonly baseURL = testData.client.baseURL;
  readonly cartButton = this.page.locator('button[routerlink="/dashboard/cart"]');
  readonly cartBadge = this.page.locator('button[routerlink="/dashboard/cart"] label');
  readonly ordersButton = this.page.locator('button[routerlink="/dashboard/myorders"]');
  readonly toastContainer = this.page.locator("#toast-container");

  async open(): Promise<void> {
    await this.actions.goto(this.baseURL);
  }

  /** Click the cart button and wait for the cart route to load. */
  async goToCart(): Promise<void> {
    await Promise.all([
      this.actions.waitForURL(/cart/, { timeout: 15000 }),
      this.actions.click(this.cartButton),
    ]);
  }

  /** Navigate to the My Orders page via the header button. */
  async goToMyOrders(): Promise<void> {
    await this.actions.click(this.ordersButton);
  }
}
