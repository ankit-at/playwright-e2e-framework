//
// ProtoCommerce (loginpagePractise) fixtures — inject the login + products pages.
//
import { test as base, expect } from "@playwright/test";
import { LoginPage, ProductsPage } from "../pages/protocommerce";

type ProtoCommerceFixtures = {
  loginPage: LoginPage;
  productsPage: ProductsPage;
};

export const test = base.extend<ProtoCommerceFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  productsPage: async ({ page }, use) => {
    await use(new ProductsPage(page));
  },
});

export { expect };
