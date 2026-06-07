// @ts-check
const { EventHubPage } = require("./eventhub.page");

/**
 * BookingDetailsPage — the single-booking detail route (`/bookings/:id`),
 * including the "Access Denied" state shown when a user opens a booking they do
 * not own (authorization / IDOR check).
 */
class BookingDetailsPage extends EventHubPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.accessDeniedHeading = page.getByText("Access Denied");
    this.accessDeniedMessage = page.getByText("You are not authorized to view this booking");
  }

  /** Open a booking by id. @param {string} bookingId */
  async open(bookingId) {
    await this.page.goto(`${this.baseURL}/bookings/${bookingId}`, { waitUntil: "networkidle" });
  }
}

module.exports = { BookingDetailsPage };
