// @ts-check
//
// RSA client e-commerce fixtures — inject the client page objects and the EcomApi
// service client. Used by the parallel client specs; the serial specs that manage
// their own context (endtoend, stateInjection, webAPIPart2) instantiate the page
// objects from the pages/client barrel in beforeAll instead.
//
const base = require("@playwright/test");
const { EcomApi } = require("../api/ecomApi");
const { LoginPage, DashboardPage, CartPage, PaymentPage, OrdersPage } = require("../pages/client");

/**
 * @typedef {Object} ClientFixtures
 * @property {LoginPage} loginPage
 * @property {DashboardPage} dashboardPage
 * @property {CartPage} cartPage
 * @property {PaymentPage} paymentPage
 * @property {OrdersPage} ordersPage
 * @property {EcomApi} ecomApi
 */

const test = base.test.extend(
  /** @type {import("@playwright/test").Fixtures<ClientFixtures, {}, import("@playwright/test").PlaywrightTestArgs & import("@playwright/test").PlaywrightTestOptions, import("@playwright/test").PlaywrightWorkerArgs & import("@playwright/test").PlaywrightWorkerOptions>} */ ({
    loginPage: async ({ page }, use) => {
      await use(new LoginPage(page));
    },
    dashboardPage: async ({ page }, use) => {
      await use(new DashboardPage(page));
    },
    cartPage: async ({ page }, use) => {
      await use(new CartPage(page));
    },
    paymentPage: async ({ page }, use) => {
      await use(new PaymentPage(page));
    },
    ordersPage: async ({ page }, use) => {
      await use(new OrdersPage(page));
    },
    ecomApi: async ({ request }, use) => {
      await use(new EcomApi(request));
    },
  }),
);

module.exports = { test, expect: base.expect };
