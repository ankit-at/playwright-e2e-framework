import type { Locator } from "@playwright/test";
import { ProtoCommercePage } from "./protocommerce.page";

/**
 * ProductsPage — the product grid shown after a successful ProtoCommerce login.
 */
export class ProductsPage extends ProtoCommercePage {
  readonly productLinks = this.page.locator("h4.card-title a");

  /** The first product's title link. */
  firstProduct(): Locator {
    return this.productLinks.first();
  }

  /** Every product name on the grid. */
  async productNames(): Promise<string[]> {
    return this.actions.getAllText(this.productLinks);
  }
}
