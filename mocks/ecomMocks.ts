import type { Page } from "@playwright/test";
import testData from "../config/testData";

const apiBase = testData.client.apiBaseURL;

/**
 * Intercept the orders API and return an empty "No Orders" payload, so the UI
 * renders the blank-orders state regardless of real server data.
 */
export async function mockEmptyOrders(page: Page): Promise<void> {
  await page.route(`${apiBase}/api/ecom/order/get-orders-for-customer/*`, async (route) => {
    const response = await page.request.fetch(route.request());
    await route.fulfill({ response, body: JSON.stringify({ data: [], message: "No Orders" }) });
  });
}

/**
 * Intercept the products API and return an empty "No Products" payload, so the
 * store renders its empty state.
 */
export async function mockEmptyProducts(page: Page): Promise<void> {
  await page.route(`${apiBase}/api/ecom/product/get-all-products`, async (route) => {
    const response = await page.request.fetch(route.request());
    await route.fulfill({ response, body: JSON.stringify({ data: [], message: "No Products" }) });
  });
}
