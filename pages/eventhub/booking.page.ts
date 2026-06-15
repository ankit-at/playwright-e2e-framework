import { EventHubPage } from "./eventhub.page";

export type CustomerDetails = { name?: string; email?: string; phone?: string };

/**
 * BookingPage — the booking form shown after "Book Now", plus the confirmation.
 */
export class BookingPage extends EventHubPage {
  readonly ticketCount = this.page.locator("#ticket-count");
  readonly incrementButton = this.page.locator('button:has-text("+")').first();
  readonly fullNameInput = this.page.getByLabel("Full Name");
  readonly emailInput = this.page.locator("#customer-email");
  readonly phoneInput = this.page.getByPlaceholder("+91 98765 43210");
  readonly confirmButton = this.page.locator(".confirm-booking-btn");
  readonly bookingRef = this.page.locator(".booking-ref").first();
  readonly confirmationHeading = this.page.locator("h3.mb-1", { hasText: /Booking Confirmed/i });
  readonly viewMyBookingsLink = this.page.getByRole("link", { name: "View My Bookings" });

  async waitUntilReady(): Promise<void> {
    await this.actions.waitFor(this.ticketCount);
  }

  async addTickets(times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.actions.click(this.incrementButton);
    }
  }

  async fillCustomerDetails({
    name = "Test Student",
    email = "test.student@example.com",
    phone = "+91 98765 43210",
  }: CustomerDetails = {}): Promise<void> {
    await this.actions.fill(this.fullNameInput, name);
    await this.actions.fill(this.emailInput, email);
    await this.actions.fill(this.phoneInput, phone);
  }

  async confirm(): Promise<void> {
    await this.actions.click(this.confirmButton.first());
  }

  async getBookingRef(): Promise<string> {
    return this.actions.getText(this.bookingRef);
  }

  async viewMyBookings(): Promise<void> {
    await this.actions.click(this.viewMyBookingsLink);
  }
}
