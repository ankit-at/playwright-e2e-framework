//
// RSA client e-commerce fixtures — inject the client page objects and the EcomApi
// service client. Used by the parallel client specs; the serial specs that manage
// their own context instantiate the page objects from the pages/client barrel.
//
import { test as base, expect } from "@playwright/test";
import { EcomApi } from "../api/ecomApi";
import { LoginPage, DashboardPage, CartPage, PaymentPage, OrdersPage } from "../pages/client";

type ClientFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  cartPage: CartPage;
  paymentPage: PaymentPage;
  ordersPage: OrdersPage;
  ecomApi: EcomApi;
};

export const test = base.extend<ClientFixtures>({
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
});

export { expect };
