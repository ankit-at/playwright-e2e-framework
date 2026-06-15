import type { APIRequestContext } from "@playwright/test";
import testData from "../config/testData";

export type Credentials = { email: string; password: string };

/**
 * EventHubApi — thin service client for the EventHub REST API
 * (api.eventhub.rahulshettyacademy.com). Methods that mirror a single endpoint
 * return the raw `APIResponse` so the spec owns every assertion (ok + parse);
 * `ensureAccount` is the one convenience that resolves a token.
 */
export class EventHubApi {
  private readonly request: APIRequestContext;
  readonly apiURL: string;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.apiURL = testData.eventhub.apiURL;
  }

  authHeaders(token: string) {
    return { Authorization: `Bearer ${token}` };
  }

  /** POST /auth/login → { success, token, user }. */
  login(user: Credentials) {
    return this.request.post(`${this.apiURL}/auth/login`, {
      data: { email: user.email, password: user.password },
    });
  }

  /** POST /auth/register. */
  register(user: Credentials) {
    return this.request.post(`${this.apiURL}/auth/register`, {
      data: { email: user.email, password: user.password },
    });
  }

  /**
   * Idempotent account seeding: register the account, or log in if it already
   * exists. Returns the auth token.
   */
  async ensureAccount(user: Credentials): Promise<string> {
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

  /** GET /events (Bearer required) → { success, data:[Event], pagination }. */
  getEvents(token: string) {
    return this.request.get(`${this.apiURL}/events`, { headers: this.authHeaders(token) });
  }

  /** POST /bookings (Bearer required) → { success, data:Booking, message }. */
  createBooking(token: string, booking: unknown) {
    return this.request.post(`${this.apiURL}/bookings`, {
      headers: this.authHeaders(token),
      data: booking,
    });
  }
}
