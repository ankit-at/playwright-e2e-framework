import { test, expect, request } from "@playwright/test";
import type { APIRequestContext } from "@playwright/test";
import testData from "../config/testData";
import { EcomApi } from "../api/ecomApi";

const client = testData.client;

test.describe("Web API Testing", () => {
  // Order placement depends on the token from beforeAll — run serially.
  test.describe.configure({ mode: "serial" });

  let apiContext: APIRequestContext;
  let ecomApi: EcomApi;
  let token: string;
  let customerId: string;

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
    const matchedOrder = orders.find((o) => o["_id"] === orderID);

    expect(matchedOrder).toBeTruthy();
    expect(matchedOrder!["_id"]).toBe(orderID);
    expect(matchedOrder!["productName"]).toBe(client.productName);

    console.log("Order ID:", matchedOrder!["_id"], "Product:", matchedOrder!["productName"]);
  });
});
