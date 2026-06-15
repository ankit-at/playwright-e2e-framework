import type { Locator } from "@playwright/test";
import { EventHubPage } from "./eventhub.page";

/**
 * MyBookingsPage — the "My Bookings" listing and booking-detail view.
 */
export class MyBookingsPage extends EventHubPage {
  readonly bookingCards = this.page.locator("#booking-card");
  readonly viewDetailsButton = this.page.locator("button", { hasText: "View Details" }).first();
  readonly bookingInformation = this.page.getByText("Booking Information");
  readonly detailEventTitle = this.page.locator("h1");
  readonly detailBookingRef = this.page.locator(".text-indigo-600").nth(1);
  readonly checkRefundButton = this.page.locator("#check-refund-btn");
  readonly refundSpinner = this.page.locator("#refund-spinner");
  readonly refundResult = this.page.locator("#refund-result");

  get url(): string {
    return `${this.baseURL}/bookings`;
  }

  async open(): Promise<void> {
    await this.actions.goto(this.url);
  }

  cardByRef(ref: string): Locator {
    return this.bookingCards.filter({ hasText: ref });
  }

  async openFirstDetails(): Promise<void> {
    await this.actions.click(this.viewDetailsButton);
    await this.actions.waitFor(this.bookingInformation);
  }

  async checkRefundEligibility(): Promise<void> {
    await this.actions.click(this.checkRefundButton);
  }
}
