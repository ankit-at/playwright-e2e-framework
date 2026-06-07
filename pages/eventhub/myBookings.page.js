// @ts-check
const { EventHubPage } = require("./eventhub.page");

/**
 * MyBookingsPage — the "My Bookings" listing (`/bookings`) and the booking-detail
 * view reached via "View Details" (refund eligibility lives here).
 */
class MyBookingsPage extends EventHubPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.bookingCards = page.locator("#booking-card");
    this.viewDetailsButton = page.locator("button", { hasText: "View Details" }).first();
    // Detail view
    this.bookingInformation = page.getByText("Booking Information");
    this.detailEventTitle = page.locator("h1");
    this.detailBookingRef = page.locator(".text-indigo-600").nth(1);
    // Refund eligibility widget
    this.checkRefundButton = page.locator("#check-refund-btn");
    this.refundSpinner = page.locator("#refund-spinner");
    this.refundResult = page.locator("#refund-result");
  }

  /** Absolute URL of the bookings listing — handy for `toHaveURL`. */
  get url() {
    return `${this.baseURL}/bookings`;
  }

  async open() {
    await this.page.goto(this.url);
  }

  /**
   * The booking card containing the given reference.
   * @param {string} ref
   * @returns {import("@playwright/test").Locator}
   */
  cardByRef(ref) {
    return this.bookingCards.filter({ hasText: ref });
  }

  /** Open the first booking's detail view and wait for it to render. */
  async openFirstDetails() {
    await this.viewDetailsButton.click();
    await this.bookingInformation.waitFor();
  }

  /** Trigger the refund-eligibility check (spinner → result). */
  async checkRefundEligibility() {
    await this.checkRefundButton.click();
  }
}

module.exports = { MyBookingsPage };
