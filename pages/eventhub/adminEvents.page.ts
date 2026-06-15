import { EventHubPage } from "./eventhub.page";

export type EventDetails = {
  title: string;
  description?: string;
  city?: string;
  venue?: string;
  dateTime?: string;
  price?: string | number;
  seats?: string | number;
};

/**
 * AdminEventsPage — the admin "create event" form (`/admin/events`).
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
    await this.actions.goto(`${this.baseURL}/admin/events`);
  }

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
    await this.actions.fill(this.titleInput, title);
    await this.actions.fill(this.descriptionInput, description);
    await this.actions.fill(this.cityInput, city);
    await this.actions.fill(this.venueInput, venue);
    await this.actions.fill(this.dateTimeInput, dateTime);
    await this.actions.fill(this.priceInput, String(price));
    await this.actions.fill(this.totalSeatsInput, String(seats));
    await this.actions.click(this.addEventButton);
    await this.actions.waitFor(this.successToast);
  }
}
