import type { Locator } from "@playwright/test";
import { EventHubPage } from "./eventhub.page";

/**
 * MyBookingsPage — the "My Bookings" listing (`/bookings`) and the booking-detail
 * view reached via "View Details" (refund eligibility lives here).
 */
export class MyBookingsPage extends EventHubPage {
  readonly bookingCards = this.page.locator("#booking-card");
  readonly viewDetailsButton = this.page.locator("button", { hasText: "View Details" }).first();
  // Detail view
  readonly bookingInformation = this.page.getByText("Booking Information");
  readonly detailEventTitle = this.page.locator("h1");
  readonly detailBookingRef = this.page.locator(".text-indigo-600").nth(1);
  // Refund eligibility widget
  readonly checkRefundButton = this.page.locator("#check-refund-btn");
  readonly refundSpinner = this.page.locator("#refund-spinner");
  readonly refundResult = this.page.locator("#refund-result");

  /** Absolute URL of the bookings listing — handy for `toHaveURL`. */
  get url(): string {
    return `${this.baseURL}/bookings`;
  }

  async open(): Promise<void> {
    await this.page.goto(this.url);
  }

  /** The booking card containing the given reference. */
  cardByRef(ref: string): Locator {
    return this.bookingCards.filter({ hasText: ref });
  }

  /** Open the first booking's detail view and wait for it to render. */
  async openFirstDetails(): Promise<void> {
    await this.viewDetailsButton.click();
    await this.bookingInformation.waitFor();
  }

  /** Trigger the refund-eligibility check (spinner → result). */
  async checkRefundEligibility(): Promise<void> {
    await this.checkRefundButton.click();
  }
}
