import type { Expect, Locator } from "@playwright/test";
import { ClientPage } from "./client.page";

/**
 * DashboardPage — the product store: the card grid, the product-detail view
 * reached via the eye icon, and add-to-cart.
 */
export class DashboardPage extends ClientPage {
  readonly productTitles = this.page.locator("div.card-body h5");
  readonly viewProductIcon = this.page.locator("i.fa.fa-eye");
  // Product-detail markers / controls
  readonly productDetail = this.page.locator("div.col-lg-6.rtl-text");
  readonly addToCartButton = this.page.locator("button.btn.btn-primary");

  /** The first product's title. */
  firstProductTitle(): Locator {
    return this.productTitles.first();
  }

  /** Open the first product's detail view and wait for it to render. */
  async viewFirstProduct(): Promise<void> {
    await this.viewProductIcon.first().click();
    await this.productDetail.waitFor();
  }

  /**
   * Add the open product to the cart, retrying until the cart badge actually
   * reflects the item. The demo backend toasts "Product Added To Cart" even when
   * the first add after landing on the detail page fails to persist server-side,
   * so the badge counter is the source of truth (see cart-and-flakiness quirks).
   * The `expect`s here are synchronization for that known quirk, not the test's
   * verification.
   * @param expect the spec's expect, injected to keep assertions out of imports
   */
  async addToCartUntilCounted(expect: Expect): Promise<void> {
    for (let attempt = 1; attempt <= 5; attempt++) {
      await this.addToCartButton.click();
      await expect(this.toastContainer).toContainText("Product Added To Cart", {
        timeout: 15000,
      });
      try {
        await expect(this.cartBadge).toHaveText(/\d+/, { timeout: 4000 });
        return;
      } catch {
        if (attempt === 5) {
          throw new Error("Cart count never updated after 5 add-to-cart attempts");
        }
        await this.page.waitForTimeout(500);
      }
    }
  }
}
