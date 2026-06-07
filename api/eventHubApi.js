// @ts-check
const testData = require("../config/testData");

/** @typedef {import("@playwright/test").APIRequestContext} APIRequestContext */
/** @typedef {{ email: string, password: string }} Credentials */

/**
 * EventHubApi — thin service client for the EventHub REST API
 * (api.eventhub.rahulshettyacademy.com). Methods that mirror a single endpoint
 * return the raw `APIResponse` so the spec owns every assertion (ok + parse);
 * `ensureAccount` is the one convenience that resolves a token.
 */
class EventHubApi {
  /** @param {APIRequestContext} request */
  constructor(request) {
    this.request = request;
    this.apiURL = testData.eventhub.apiURL;
  }

  /** @param {string} token */
  authHeaders(token) {
    return { Authorization: `Bearer ${token}` };
  }

  /** POST /auth/login → { success, token, user }. @param {Credentials} user */
  login(user) {
    return this.request.post(`${this.apiURL}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
  }

  /** POST /auth/register. @param {Credentials} user */
  register(user) {
    return this.request.post(`${this.apiURL}/auth/register`, {
      data: { email: user.email, password: user.password },
    });
  }

  /**
   * Idempotent account seeding: register the account, or log in if it already
   * exists. Returns the auth token.
   * @param {Credentials} user
   * @returns {Promise<string>}
   */
  async ensureAccount(user) {
    const register = await this.register(user);
    if (register.ok()) {
      return (await register.json()).token;
    }

    // Most likely already registered from a previous run → log in instead.
    const login = await this.login(user);
    if (!login.ok()) {
      throw new Error(
        `ensureAccount: could not register or log in ${user.email} ` +
          `(register=${register.status()}, login=${login.status()})`,
      );
    }
    return (await login.json()).token;
  }

  /** GET /events (Bearer required) → { success, data:[Event], pagination }. @param {string} token */
  getEvents(token) {
    return this.request.get(`${this.apiURL}/events`, { headers: this.authHeaders(token) });
  }

  /**
   * POST /bookings (Bearer required) → { success, data:Booking, message }.
   * @param {string} token
   * @param {unknown} booking
   */
  createBooking(token, booking) {
    return this.request.post(`${this.apiURL}/bookings`, {
      headers: this.authHeaders(token),
      data: booking,
    });
  }
}

module.exports = { EventHubApi };
