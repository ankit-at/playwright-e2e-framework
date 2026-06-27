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
    await this.actions.click(this.viewProductIcon.first());
    await this.actions.waitFor(this.productDetail);
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
      await this.actions.click(this.addToCartButton);
      try {
        // The optimistic UI sometimes neither toasts nor persists the first add after
        // landing on the detail page — treat BOTH a missing toast and a stale cart
        // badge as a failed attempt and re-click, rather than hard-failing on either.
        await expect(this.toastContainer).toContainText("Product Added To Cart", {
          timeout: 7000,
        });
        await expect(this.cartBadge).toHaveText(/\d+/, { timeout: 4000 });
        return;
      } catch {
        if (attempt === 5) {
          throw new Error("Cart count never updated after 5 add-to-cart attempts");
        }
        await this.actions.waitForTimeout(500);
      }
    }
  }
}
