import type { Locator } from "@playwright/test";
import { EventHubPage } from "./eventhub.page";

/**
 * EventsPage — the public events listing (`/events`).
 */
export class EventsPage extends EventHubPage {
  readonly eventCards = this.page.getByTestId("event-card");
  readonly sandboxBanner = this.page.getByText(/sandbox holds up to/i);

  async open(): Promise<void> {
    await this.actions.goto(`${this.baseURL}/events`);
  }

  cardByTitle(title: string): Locator {
    return this.eventCards.filter({ hasText: title }).first();
  }

  async seatsFor(card: Locator): Promise<number> {
    return parseInt(await this.actions.getText(card.getByText("seat").first()));
  }

  async bookNow(card: Locator): Promise<void> {
    await this.actions.click(card.getByTestId("book-now-btn"));
  }
}
