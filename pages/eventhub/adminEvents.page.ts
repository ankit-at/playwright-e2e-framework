import { EventHubPage } from "./eventhub.page";

export type EventDetails = {
  /** unique title used to find the card later */
  title: string;
  description?: string;
  city?: string;
  venue?: string;
  /** datetime-local value, e.g. "2027-12-31T10:00" */
  dateTime?: string;
  price?: string | number;
  seats?: string | number;
};

/**
 * AdminEventsPage — the admin "create event" form (`/admin/events`).
 *
 * The pre-seeded demo events (isStatic) show large seat counts but are
 * unbookable, so booking tests must create their own event first. `createEvent`
 * is the shared arrange step for that.
 */
export class AdminEventsPage extends EventHubPage {
  readonly titleInput = this.page.locator("#event-title-input");
  readonly descriptionInput = this.page.locator("#admin-event-form textarea");
  readonly cityInput = this.page.getByLabel("City");
  readonly venueInput = this.page.getByLabel("Venue");
  readonly dateTimeInput = this.page.getByLabel("Event Date & Time");
  readonly priceInput = this.page.getByLabel("Price ($)");
  readonly totalSeatsInput = this.page.getByLabel("Total Seats");
  readonly addEventButton = this.page.locator("#add-event-btn");
  readonly successToast = this.page.getByText("Event created!");

  async open(): Promise<void> {
    await this.page.goto(`${this.baseURL}/admin/events`);
  }

  /**
   * Fill and submit the admin event form. Waits for the success toast so the
   * event is persisted before callers navigate away (synchronization, not an
   * assertion — specs may still assert on `successToast`).
   */
  async createEvent({
    title,
    description = "Playwright test event",
    city = "Test City",
    venue = "Test Venue",
    dateTime = "2027-12-31T10:00",
    price = "100",
    seats = "50",
  }: EventDetails): Promise<void> {
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
