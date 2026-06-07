// @ts-check
const { EventHubPage } = require("./eventhub.page");

/**
 * @typedef {Object} EventDetails
 * @property {string} title              unique title used to find the card later
 * @property {string} [description]
 * @property {string} [city]
 * @property {string} [venue]
 * @property {string} [dateTime]         datetime-local value, e.g. "2027-12-31T10:00"
 * @property {string|number} [price]
 * @property {string|number} [seats]
 */

/**
 * AdminEventsPage — the admin "create event" form (`/admin/events`).
 *
 * The pre-seeded demo events (isStatic) show large seat counts but are
 * unbookable, so booking tests must create their own event first. `createEvent`
 * is the shared arrange step for that.
 */
class AdminEventsPage extends EventHubPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.titleInput = page.locator("#event-title-input");
    this.descriptionInput = page.locator("#admin-event-form textarea");
    this.cityInput = page.getByLabel("City");
    this.venueInput = page.getByLabel("Venue");
    this.dateTimeInput = page.getByLabel("Event Date & Time");
    this.priceInput = page.getByLabel("Price ($)");
    this.totalSeatsInput = page.getByLabel("Total Seats");
    this.addEventButton = page.locator("#add-event-btn");
    this.successToast = page.getByText("Event created!");
  }

  async open() {
    await this.page.goto(`${this.baseURL}/admin/events`);
  }

  /**
   * Fill and submit the admin event form. Waits for the success toast so the
   * event is persisted before callers navigate away (synchronization, not an
   * assertion — specs may still assert on `successToast`).
   * @param {EventDetails} details
   */
  async createEvent({
    title,
    description = "Playwright test event",
    city = "Test City",
    venue = "Test Venue",
    dateTime = "2027-12-31T10:00",
    price = "100",
    seats = "50",
  }) {
    await this.open();
    await this.titleInput.fill(title);
    await this.descriptionInput.fill(description);
    await this.cityInput.fill(city);
    await this.venueInput.fill(venue);
    await this.dateTimeInput.fill(dateTime);
    await this.priceInput.fill(String(price));
    await this.totalSeatsInput.fill(String(seats));
    await this.addEventButton.click();
    await this.successToast.waitFor();
  }
}

module.exports = { AdminEventsPage };
