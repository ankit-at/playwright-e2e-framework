// @ts-check
//
// ProtoCommerce (loginpagePractise) fixtures — inject the login + products pages.
//
const base = require("@playwright/test");
const { LoginPage, ProductsPage } = require("../pages/protocommerce");

/**
 * @typedef {Object} ProtoCommerceFixtures
 * @property {LoginPage} loginPage
 * @property {ProductsPage} productsPage
 */

const test = base.test.extend(
  /** @type {import("@playwright/test").Fixtures<ProtoCommerceFixtures, {}, import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>} */ ({
    loginPage: async ({ page }, use) => {
      await use(new LoginPage(page));
    },
    productsPage: async ({ page }, use) => {
      await use(new ProductsPage(page));
    },
  }),
);

module.exports = { test, expect: base.expect };
