// @ts-check
const { EventHubPage } = require("./eventhub.page");

/**
 * EventsPage — the public events listing (`/events`).
 *
 * Owns the event-card grid and the "sandbox" banner. Card-scoped helpers return
 * Locators / values so specs do the asserting.
 */
class EventsPage extends EventHubPage {
  /** @param {import("@playwright/test").Page} page */
  constructor(page) {
    super(page);
    this.eventCards = page.getByTestId("event-card");
    this.sandboxBanner = page.getByText(/sandbox holds up to/i);
  }

  async open() {
    await this.page.goto(`${this.baseURL}/events`);
  }

  /**
   * The first event card whose text contains `title`.
   * @param {string} title
   * @returns {import("@playwright/test").Locator}
   */
  cardByTitle(title) {
    return this.eventCards.filter({ hasText: title }).first();
  }

  /**
   * Available-seat count shown on a given card.
   * @param {import("@playwright/test").Locator} card
   * @returns {Promise<number>}
   */
  async seatsFor(card) {
    return parseInt(await card.getByText("seat").first().innerText());
  }

  /**
   * Click "Book Now" on a given card, opening the booking form.
   * @param {import("@playwright/test").Locator} card
   */
  async bookNow(card) {
    await card.getByTestId("book-now-btn").click();
  }
}

module.exports = { EventsPage };
