import { EventHubPage } from "./eventhub.page";

export type CustomerDetails = { name?: string; email?: string; phone?: string };

/**
 * BookingPage — the booking form shown after "Book Now", plus the confirmation
 * that replaces it on success.
 */
export class BookingPage extends EventHubPage {
  readonly ticketCount = this.page.locator("#ticket-count");
  readonly incrementButton = this.page.locator('button:has-text("+")').first();
  readonly fullNameInput = this.page.getByLabel("Full Name");
  readonly emailInput = this.page.locator("#customer-email");
  readonly phoneInput = this.page.getByPlaceholder("+91 98765 43210");
  readonly confirmButton = this.page.locator(".confirm-booking-btn");
  // Confirmation surface
  readonly bookingRef = this.page.locator(".booking-ref").first();
  readonly confirmationHeading = this.page.locator("h3.mb-1", { hasText: /Booking Confirmed/i });
  readonly viewMyBookingsLink = this.page.getByRole("link", { name: "View My Bookings" });

  /** Wait for the booking form to be interactive (ticket counter rendered). */
  async waitUntilReady(): Promise<void> {
    await this.ticketCount.waitFor();
  }

  /** Bump the ticket quantity by clicking "+" `times` times (0 = single ticket). */
  async addTickets(times: number): Promise<void> {
    for (let i = 0; i < times; i++) {
      await this.incrementButton.click();
    }
  }

  async fillCustomerDetails({
    name = "Test Student",
    email = "test.student@example.com",
    phone = "+91 98765 43210",
  }: CustomerDetails = {}): Promise<void> {
    await this.fullNameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async confirm(): Promise<void> {
    await this.confirmButton.first().click();
  }

  /** The trimmed booking reference from the confirmation. */
  async getBookingRef(): Promise<string> {
    return (await this.bookingRef.innerText()).trim();
  }

  /** Navigate from the confirmation to the My Bookings page. */
  async viewMyBookings(): Promise<void> {
    await this.viewMyBookingsLink.click();
  }
}
