import type { APIRequestContext } from "@playwright/test";
import testData from "../config/testData";

/**
 * EcomApi — service client for the rahulshettyacademy `/api/ecom` REST API behind
 * the Angular client app. Lets specs seed state (tokens, orders, products) via the
 * API instead of driving the UI.
 */
export class EcomApi {
  private readonly request: APIRequestContext;
  readonly baseURL: string;
  private readonly credentials: { email: string; password: string };

  constructor(request: APIRequestContext) {
    this.request = request;
    this.baseURL = testData.client.apiBaseURL;
    this.credentials = testData.client.credentials;
  }

  authHeaders(token: string) {
    return { "Content-Type": "application/json", Authorization: token };
  }

  /** Authenticate and return the auth token plus customer id. */
  async login(): Promise<{ token: string; customerId: string }> {
    const res = await this.request.post(`${this.baseURL}/api/ecom/auth/login`, {
      data: {
        userEmail: this.credentials.email,
        userPassword: this.credentials.password,
      },
    });
    const body = await res.json();
    return { token: body.token, customerId: body.userId };
  }

  /** Full product catalogue. */
  async getAllProducts(token: string) {
    const res = await this.request.post(`${this.baseURL}/api/ecom/product/get-all-products`, {
      headers: this.authHeaders(token),
    });
    return res.json();
  }

  /** Resolve a product id by name. */
  async findProductId(token: string, productName: string): Promise<string | undefined> {
    const products = await this.getAllProducts(token);
    return products.data.find((p: { productName: string; _id: string }) => p.productName === productName)
      ?._id;
  }

  /** Create an order for a product; returns the created order id. */
  async createOrder(
    token: string,
    { country, productId }: { country: string; productId: string },
  ): Promise<string> {
    const res = await this.request.post(`${this.baseURL}/api/ecom/order/create-order`, {
      headers: this.authHeaders(token),
      data: { orders: [{ country, productOrderedId: productId }] },
    });
    const body = await res.json();
    return body.orders[0];
  }

  /** All orders for a customer. */
  async getOrdersForCustomer(token: string, customerId: string): Promise<Record<string, unknown>[]> {
    const res = await this.request.get(
      `${this.baseURL}/api/ecom/order/get-orders-for-customer/${customerId}`,
      { headers: this.authHeaders(token) },
    );
    return (await res.json()).data;
  }

  // ── Convenience seeders (log in, then do the work) ─────────────────────────────

  /** Log in, find the configured product, and place an order for it. */
  async seedOrder(): Promise<{ token: string; customerId: string; orderID: string }> {
    const { token, customerId } = await this.login();
    const productId = await this.findProductId(token, testData.client.productName);
    if (!productId) throw new Error(`Product not found: ${testData.client.productName}`);
    const orderID = await this.createOrder(token, { country: testData.client.country, productId });
    return { token, customerId, orderID };
  }

  /** Log in and return the full product list (used to drive the empty-store mock). */
  async seedProducts(): Promise<{ token: string; productList: unknown }> {
    const { token } = await this.login();
    const productList = await this.getAllProducts(token);
    return { token, productList };
  }
}
