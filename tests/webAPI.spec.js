const { test, expect, request } = require("@playwright/test");
const testData = require("../config/testData");
const { EcomApi } = require("../api/ecomApi");

const client = testData.client;

test.describe("Web API Testing", () => {
  // Order placement depends on the token from beforeAll — run serially.
  test.describe.configure({ mode: "serial" });

  /** @type {import("@playwright/test").APIRequestContext} */
  let apiContext;
  /** @type {EcomApi} */
  let ecomApi;
  /** @type {string} */
  let token;
  /** @type {string} */
  let customerId;

  test.beforeAll(async () => {
    apiContext = await request.newContext();
    ecomApi = new EcomApi(apiContext);

    const auth = await ecomApi.login();
    token = auth.token;
    customerId = auth.customerId;
    // Do not log token/customerId — they are sensitive credentials.
    expect(token).toBeTruthy();
  });

  test.afterAll(async () => {
    await apiContext?.dispose();
  });

  test("Place order", async () => {
    // Look up the product id by name, place an order, then confirm it is listed.
    const productId = await ecomApi.findProductId(token, client.productName);
    if (!productId) throw new Error(`Product not found: ${client.productName}`);

    const orderID = await ecomApi.createOrder(token, { country: client.country, productId });
    expect(orderID).toBeTruthy();

    const orders = await ecomApi.getOrdersForCustomer(token, customerId);
    const matchedOrder = orders.find((/** @type {any} */ o) => o._id === orderID);

    expect(matchedOrder).toBeTruthy();
    expect(matchedOrder._id).toBe(orderID);
    expect(matchedOrder.productName).toBe(client.productName);

    console.log("Order ID:", matchedOrder._id, "Product:", matchedOrder.productName);
  });
});
