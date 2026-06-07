// @ts-check
const { EventHubPage } = require("./eventhub.page");

/**
 * @typedef {Object} CustomerDetails
 * @property {string} [name]
 * @property {string} [email]
 * @property {string} [phone]
 */

/**
 * BookingPage — the booking form shown after "Book Now", plus the confirmation
 * that replaces it on success.
 */
class BookingPage extends EventHubPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.ticketCount = page.locator("#ticket-count");
    this.incrementButton = page.locator('button:has-text("+")').first();
    this.fullNameInput = page.getByLabel("Full Name");
    this.emailInput = page.locator("#customer-email");
    this.phoneInput = page.getByPlaceholder("+91 98765 43210");
    this.confirmButton = page.locator(".confirm-booking-btn");
    // Confirmation surface
    this.bookingRef = page.locator(".booking-ref").first();
    this.confirmationHeading = page.locator("h3.mb-1", { hasText: /Booking Confirmed/i });
    this.viewMyBookingsLink = page.getByRole("link", { name: "View My Bookings" });
  }

  /** Wait for the booking form to be interactive (ticket counter rendered). */
  async waitUntilReady() {
    await this.ticketCount.waitFor();
  }

  /**
   * Bump the ticket quantity by clicking "+" `times` times (0 = single ticket).
   * @param {number} times
   */
  async addTickets(times) {
    for (let i = 0; i < times; i++) {
      await this.incrementButton.click();
    }
  }

  /** @param {CustomerDetails} [details] */
  async fillCustomerDetails({
    name = "Test Student",
    email = "test.student@example.com",
    phone = "+91 98765 43210",
  } = {}) {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async confirm() {
    await this.confirmButton.first().click();
  }

  /** @returns {Promise<string>} the trimmed booking reference from the confirmation. */
  async getBookingRef() {
    return (await this.bookingRef.innerText()).trim();
  }

  /** Navigate from the confirmation to the My Bookings page. */
  async viewMyBookings() {
    await this.viewMyBookingsLink.click();
  }
}

module.exports = { BookingPage };
