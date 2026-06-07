// @ts-check
const testData = require("../config/testData");

/** @typedef {import("@playwright/test").APIRequestContext} APIRequestContext */

/**
 * EcomApi — service client for the rahulshettyacademy `/api/ecom` REST API behind
 * the Angular client app. Lets specs seed state (tokens, orders, products) via the
 * API instead of driving the UI. Replaces the old utils/APiUtils.js.
 */
class EcomApi {
  /** @param {APIRequestContext} request */
  constructor(request) {
    this.request = request;
    this.baseURL = testData.client.apiBaseURL;
    this.credentials = testData.client.credentials;
  }

  /** @param {string} token */
  authHeaders(token) {
    return { "Content-Type": "application/json", Authorization: token };
  }

  /**
   * Authenticate and return the auth token plus customer id.
   * @returns {Promise<{ token: string, customerId: string }>}
   */
  async login() {
    const res = await this.request.post(`${this.baseURL}/api/ecom/auth/login`, {
      data: {
        userEmail: this.credentials.email,
        userPassword: this.credentials.password,
      },
    });
    const body = await res.json();
    return { token: body.token, customerId: body.userId };
  }

  /** Full product catalogue. @param {string} token */
  async getAllProducts(token) {
    const res = await this.request.post(`${this.baseURL}/api/ecom/product/get-all-products`, {
      headers: this.authHeaders(token),
    });
    return res.json();
  }

  /**
   * Resolve a product id by name.
   * @param {string} token
   * @param {string} productName
   * @returns {Promise<string | undefined>}
   */
  async findProductId(token, productName) {
    const products = await this.getAllProducts(token);
    return products.data.find((/** @type {any} */ p) => p.productName === productName)?._id;
  }

  /**
   * Create an order for a product.
   * @param {string} token
   * @param {{ country: string, productId: string }} order
   * @returns {Promise<string>} the created order id
   */
  async createOrder(token, { country, productId }) {
    const res = await this.request.post(`${this.baseURL}/api/ecom/order/create-order`, {
      headers: this.authHeaders(token),
      data: { orders: [{ country, productOrderedId: productId }] },
    });
    const body = await res.json();
    return body.orders[0];
  }

  /**
   * All orders for a customer.
   * @param {string} token
   * @param {string} customerId
   * @returns {Promise<any[]>}
   */
  async getOrdersForCustomer(token, customerId) {
    const res = await this.request.get(
      `${this.baseURL}/api/ecom/order/get-orders-for-customer/${customerId}`,
      { headers: this.authHeaders(token) },
    );
    return (await res.json()).data;
  }

  // ── Convenience seeders (log in, then do the work) ─────────────────────────────

  /**
   * Log in, find the configured product, and place an order for it.
   * @returns {Promise<{ token: string, customerId: string, orderID: string }>}
   */
  async seedOrder() {
    const { token, customerId } = await this.login();
    const productId = await this.findProductId(token, testData.client.productName);
    if (!productId) throw new Error(`Product not found: ${testData.client.productName}`);
    const orderID = await this.createOrder(token, { country: testData.client.country, productId });
    return { token, customerId, orderID };
  }

  /**
   * Log in and return the full product list (used to drive the empty-store mock).
   * @returns {Promise<{ token: string, productList: any }>}
   */
  async seedProducts() {
    const { token } = await this.login();
    const productList = await this.getAllProducts(token);
    return { token, productList };
  }
}

module.exports = { EcomApi };
