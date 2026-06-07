// @ts-check
const { ProtoCommercePage } = require("./protocommerce.page");

/**
 * ProductsPage — the product grid shown after a successful ProtoCommerce login.
 */
class ProductsPage extends ProtoCommercePage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.productLinks = page.locator("h4.card-title a");
  }

  /** @returns {import("@playwright/test").Locator} the first product's title link. */
  firstProduct() {
    return this.productLinks.first();
  }

  /** @returns {Promise<string[]>} every product name on the grid. */
  async productNames() {
    return this.productLinks.allTextContents();
  }
}

module.exports = { ProductsPage };
