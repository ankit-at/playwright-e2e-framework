import type { Locator } from "@playwright/test";
import { EventHubPage } from "./eventhub.page";

/**
 * EventsPage — the public events listing (`/events`).
 *
 * Owns the event-card grid and the "sandbox" banner. Card-scoped helpers return
 * Locators / values so specs do the asserting.
 */
export class EventsPage extends EventHubPage {
  readonly eventCards = this.page.getByTestId("event-card");
  readonly sandboxBanner = this.page.getByText(/sandbox holds up to/i);

  async open(): Promise<void> {
    await this.page.goto(`${this.baseURL}/events`);
  }

  /** The first event card whose text contains `title`. */
  cardByTitle(title: string): Locator {
    return this.eventCards.filter({ hasText: title }).first();
  }

  /** Available-seat count shown on a given card. */
  async seatsFor(card: Locator): Promise<number> {
    return parseInt(await card.getByText("seat").first().innerText());
  }

  /** Click "Book Now" on a given card, opening the booking form. */
  async bookNow(card: Locator): Promise<void> {
    await card.getByTestId("book-now-btn").click();
  }
}
