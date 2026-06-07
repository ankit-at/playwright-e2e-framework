const { test, request } = require("@playwright/test");
const testData = require("../config/testData");
const { EcomApi } = require("../api/ecomApi");
const { mockEmptyOrders, mockEmptyProducts } = require("../mocks/ecomMocks");
const { DashboardPage, OrdersPage } = require("../pages/client");

const client = testData.client;

/** @type {{ token: string, customerId: string, orderID: string }} */
let order;
/** @type {{ token: string, productList: any }} */
let products;

// Seed real state via the API so the SPA can be driven into specific UI states.
test.beforeAll(async () => {
  const apiContext = await request.newContext();
  const ecomApi = new EcomApi(apiContext);
  order = await ecomApi.seedOrder();
  products = await ecomApi.seedProducts();
  await apiContext.dispose();
});

test("Place the order", async ({ page }) => {
  // Seed the auth token so the SPA loads already logged in.
  await page.addInitScript((value) => {
    globalThis.localStorage.setItem("token", value);
  }, order.token);

  await mockEmptyOrders(page);

  const orders = new OrdersPage(page);
  await orders.open();
  await orders.goToMyOrders();
  await page.waitForResponse(`${client.apiBaseURL}/api/ecom/order/get-orders-for-customer/*`);

  console.log(await orders.emptyMessage.textContent());
  await page.close();
});

test("Verify the blank Items Page", async ({ page }) => {
  await page.addInitScript((value) => {
    globalThis.localStorage.setItem("token", value);
  }, products.token);

  await mockEmptyProducts(page);

  const dashboard = new DashboardPage(page);
  await dashboard.open();
  await page.waitForLoadState("networkidle");
});
